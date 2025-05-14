package http

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"os"
	"strings"

	"time"

	"foundersignal/internal/pkg/auth"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.uber.org/zap"
)

const (
	userIDContextKey = "userId"
)

var appLogger *zap.Logger

type ClerkAuth struct {
	jwksManager *auth.JWKSManager
	// expectedIssuer string // Example
}

func CORS() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000", "https://www.foundersignal.com", "https://foundersignal.com"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}

func InitializeLogger(env string) {
	var err error
	if strings.ToLower(env) == "development" {
		appLogger, err = zap.NewDevelopment()
		if err == nil {
			appLogger.Info("Development logger initialized.")
		}
	} else {
		appLogger, err = zap.NewProduction()
		if err == nil {
			appLogger.Info("Production logger initialized.")
		}
	}
	if err != nil {
		// Fallback to a basic logger if zap initialization fails
		fmt.Printf("Failed to initialize zap logger: %v. Using fallback production logger.\n", err)
		appLogger, _ = zap.NewProduction()
	}
}

func NewClerkAuth(jwksURL string) *ClerkAuth {
	return &ClerkAuth{
		jwksManager: auth.NewJWKSManager(jwksURL),
		// expectedIssuer: "clerk-issuer-url", // Example
	}
}

func (ca *ClerkAuth) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		requestPath := c.Request.URL.Path
		isProtectedPath := strings.Contains(requestPath, "/dashboard/")

		tokenString, err := extractBearerToken(c)
		if err != nil && isProtectedPath { // Only enforce token presence for protected paths
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization header is required"})
			return
		}

		// If token is present, always try to verify it.
		userID, err := ca.verifyToken(c.Request.Context(), tokenString)
		if err != nil {
			if isProtectedPath {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": fmt.Sprintf("Invalid token: %s", err.Error())})
				return
			}
			// For public paths, if token is present but invalid, log it but don't abort.
			fmt.Printf("Info: Invalid token presented for public path %s: %v\n", requestPath, err)
		}

		c.Set(userIDContextKey, userID)
		c.Next()
	}
}

func (ca *ClerkAuth) verifyToken(ctx context.Context, tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid header not found in token")
		}

		return ca.jwksManager.GetPublicKey(ctx, kid)
	})

	if err != nil {
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", errors.New("token has expired")
		}

		return "", fmt.Errorf("token parsing/validation failed: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", errors.New("invalid token or claims")
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("user ID (sub) not found in token claims")
	}

	// Optional: Validate issuer
	// if iss, ok := claims["iss"].(string); !ok || iss != ca.expectedIssuer {
	//  return "", fmt.Errorf("invalid token issuer: expected %s, got %s", ca.expectedIssuer, iss)
	// }

	return userID, nil
}

func extractBearerToken(c *gin.Context) (string, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		// For public routes, this is not an error, but verifyToken will handle it if isProtectedPath
		return "", errors.New("authorization header is missing")
	}

	parts := strings.Split(authHeader, " ")
	if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
		return "", errors.New("authorization header format must be Bearer {token}")
	}

	return parts[1], nil
}

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()
		if len(c.Errors) > 0 {
			// Check if response was already written
			if !c.Writer.Written() {
				status := c.Writer.Status()
				if status == http.StatusOK { // If no status was set but there are errors, default to 500
					status = http.StatusInternalServerError
				}
				c.JSON(status, gin.H{ // Use the status that might have been set by c.AbortWithStatusJSON
					"errors": c.Errors.ByType(gin.ErrorTypeAny).Errors(),
				})
			}
		}
	}
}

func GetLogger() *zap.Logger {
	if appLogger == nil {
		// This is a fallback, ideally InitializeLogger or init() should have run.
		appEnv := os.Getenv("APP_ENV")
		InitializeLogger(appEnv)
		appLogger.Warn("Logger was not initialized prior to GetLogger() call; initialized now.")
	}
	return appLogger
}

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		raw := c.Request.URL.RawQuery

		logger := GetLogger()

		c.Next()

		latency := time.Since(start)
		clientIP := c.ClientIP()
		method := c.Request.Method
		statusCode := c.Writer.Status()
		bodySize := c.Writer.Size()

		logFields := []zap.Field{
			zap.String("method", method),
			zap.String("path", path),
			zap.Int("status", statusCode),
			zap.Duration("latency", latency),
			zap.String("ip", clientIP),
			zap.Int("body_size", bodySize),
		}
		if raw != "" {
			logFields = append(logFields, zap.String("query", raw))
		}

		if len(c.Errors) > 0 {
			logFields = append(logFields, zap.String("errors", c.Errors.String()))
		}

		logger.Info("request", logFields...)
	}
}
