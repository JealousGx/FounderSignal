package http

import (
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

const (
	jwksCacheDuration = 1 * time.Hour
	userIDContextKey  = "userId"
)

type ClerkAuth struct {
	jwksURL string
	cache   struct {
		keys map[string]*rsa.PublicKey
		exp  time.Time
		mu   sync.RWMutex
	}
}

func CORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}

// a ClerkAuth middleware to verify JWT tokens from Clerk
// basically, can be implemented for any other auth provider (or custom auth).
// just need to verify the session
// and extract userId from the token and set it in the context
func NewClerkAuth(jwksURL string) *ClerkAuth {
	return &ClerkAuth{
		jwksURL: jwksURL,
		cache: struct {
			keys map[string]*rsa.PublicKey
			exp  time.Time
			mu   sync.RWMutex
		}{
			keys: make(map[string]*rsa.PublicKey),
			exp:  time.Now(),
		},
	}
}

func (a *ClerkAuth) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		isProtectedPath := strings.Contains(c.Request.URL.Path, "/dashboard/")

		tokenString, err := extractBearerToken(c)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		userID, err := a.verifyToken(tokenString)
		if err != nil && isProtectedPath {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}

		c.Set(userIDContextKey, userID)
		c.Next()
	}
}

func (a *ClerkAuth) verifyToken(tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid header not found")
		}

		return a.getPublicKey(kid)
	})

	if err != nil {
		return "", fmt.Errorf("invalid token: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", errors.New("invalid token claims")
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("user ID not found in token")
	}

	return userID, nil
}

func (a *ClerkAuth) getPublicKey(kid string) (*rsa.PublicKey, error) {
	// Check cache first with read lock
	a.cache.mu.RLock()
	if key, found := a.cache.keys[kid]; found && time.Now().Before(a.cache.exp) {
		a.cache.mu.RUnlock()
		return key, nil
	}
	a.cache.mu.RUnlock()

	// Cache miss, fetch fresh
	a.cache.mu.Lock()
	defer a.cache.mu.Unlock()

	// Double check in case another goroutine updated it
	if key, found := a.cache.keys[kid]; found && time.Now().Before(a.cache.exp) {
		return key, nil
	}

	resp, err := http.Get(a.jwksURL)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("JWKS endpoint returned status %d", resp.StatusCode)
	}

	var jwks struct {
		Keys []struct {
			Kid string   `json:"kid"`
			Kty string   `json:"kty"`
			Alg string   `json:"alg"`
			Use string   `json:"use"`
			N   string   `json:"n"`
			E   string   `json:"e"`
			X5c []string `json:"x5c"`
		} `json:"keys"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS: %w", err)
	}

	for _, key := range jwks.Keys {
		if key.Kid == kid {
			// Try x5c first, fall back to N/E if not available
			if len(key.X5c) > 0 {
				publicKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(key.X5c[0]))
				if err != nil {
					return nil, fmt.Errorf("failed to parse public key from x5c: %w", err)
				}
				a.cache.keys[kid] = publicKey
				a.cache.exp = time.Now().Add(jwksCacheDuration)
				return publicKey, nil
			}

			// Fallback to RSA modulus/exponent if x5c is empty
			if key.N != "" && key.E != "" {
				publicKey, err := parseRSAPublicKeyFromExponent(key.N, key.E)
				if err != nil {
					return nil, fmt.Errorf("failed to parse public key from N/E: %w", err)
				}
				a.cache.keys[kid] = publicKey
				a.cache.exp = time.Now().Add(jwksCacheDuration)
				return publicKey, nil
			}

			return nil, errors.New("key found but no valid public key material (x5c or N/E)")
		}
	}

	return nil, fmt.Errorf("no matching key found for kid: %s", kid)
}

func parseRSAPublicKeyFromExponent(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus: %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent: %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	e := int(new(big.Int).SetBytes(eBytes).Int64())

	return &rsa.PublicKey{
		N: n,
		E: e,
	}, nil
}

func extractBearerToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}

	tokenString := strings.TrimPrefix(authHeader, "Bearer ")
	if tokenString == authHeader {
		return "", errors.New("invalid authorization format")
	}

	return tokenString, nil
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if len(c.Errors) > 0 {
			c.JSON(c.Writer.Status(), gin.H{
				"errors": c.Errors.Errors(),
			})
		}
	}
}

func Logger() gin.HandlerFunc {
	logger, _ := zap.NewProduction()
	defer logger.Sync()

	return func(c *gin.Context) {
		start := time.Now()
		c.Next()
		logger.Info("Request",
			zap.String("path", c.Request.URL.Path),
			zap.Duration("latency", time.Since(start)),
		)
	}
}
