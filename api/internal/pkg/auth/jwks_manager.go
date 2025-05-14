package auth

import (
	"context"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"math/big"
	"net/http"
	"sync"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

const (
	defaultJwksCacheDuration = 1 * time.Hour
)

// JWKSManager handles fetching, caching, and providing RSA public keys from a JWKS endpoint.
type JWKSManager struct {
	jwksURL string
	cache   struct {
		keys map[string]*rsa.PublicKey
		exp  time.Time
		mu   sync.RWMutex
	}
	httpClient *http.Client
}

// NewJWKSManager creates a new JWKSManager.
// jwksURL is the URL to fetch the JSON Web Key Set.
func NewJWKSManager(jwksURL string) *JWKSManager {
	return &JWKSManager{
		jwksURL: jwksURL,
		cache: struct {
			keys map[string]*rsa.PublicKey
			exp  time.Time
			mu   sync.RWMutex
		}{
			keys: make(map[string]*rsa.PublicKey),
			// Initialize exp to a time in the past to force initial fetch
			exp: time.Now().Add(-1 * time.Minute),
		},
		httpClient: &http.Client{Timeout: 10 * time.Second}, // Default HTTP client with timeout
	}
}

// GetPublicKey retrieves the RSA public key for the given Key ID (kid).
// It fetches and caches JWKS as needed.
func (m *JWKSManager) GetPublicKey(ctx context.Context, kid string) (*rsa.PublicKey, error) {
	m.cache.mu.RLock()
	key, found := m.cache.keys[kid]
	isCacheValid := time.Now().Before(m.cache.exp)
	m.cache.mu.RUnlock()

	if found && isCacheValid {
		return key, nil
	}

	// Cache miss or expired, acquire write lock and fetch fresh
	m.cache.mu.Lock()
	defer m.cache.mu.Unlock()

	// Double-check if another goroutine refreshed the cache while waiting for the lock
	key, found = m.cache.keys[kid]
	isCacheValid = time.Now().Before(m.cache.exp)
	if found && isCacheValid {
		return key, nil
	}

	// Fetch new JWKS
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, m.jwksURL, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request for JWKS: %w", err)
	}

	resp, err := m.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch JWKS from %s: %w", m.jwksURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("JWKS endpoint returned status %d for URL %s", resp.StatusCode, m.jwksURL)
	}

	var jwks struct {
		Keys []struct {
			Kid string   `json:"kid"`
			Kty string   `json:"kty"`
			Alg string   `json:"alg"` // Optional, can be used for validation
			Use string   `json:"use"` // Optional, "sig" for signature
			N   string   `json:"n"`
			E   string   `json:"e"`
			X5c []string `json:"x5c"` // For X.509 certificate chain
		} `json:"keys"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&jwks); err != nil {
		return nil, fmt.Errorf("failed to decode JWKS JSON: %w", err)
	}

	newKeys := make(map[string]*rsa.PublicKey)
	var firstError error // Store the first parsing error, if any

	for _, k := range jwks.Keys {
		if k.Kty != "RSA" { // We are interested in RSA keys
			continue
		}

		var publicKey *rsa.PublicKey
		var parseErr error

		// Try x5c first, as it's often preferred if present
		if len(k.X5c) > 0 {
			publicKey, err := jwt.ParseRSAPublicKeyFromPEM([]byte(k.X5c[0]))
			if err != nil {
				parseErr = fmt.Errorf("failed to parse public key from x5c: %w", err)
			}
			m.cache.keys[kid] = publicKey
			m.cache.exp = time.Now().Add(defaultJwksCacheDuration)
		}

		// Fallback to RSA modulus/exponent (N/E), which is standard for Clerk
		if k.N != "" && k.E != "" {
			publicKey, parseErr = parseRSAPublicKeyFromModulusExponent(k.N, k.E)
		} else { // If no N/E and x5c parsing failed or wasn't attempted robustly
			if parseErr == nil { // if parseErr is nil, it means no valid material was found
				parseErr = errors.New("key material (N/E or x5c) not found or not RSA")
			}
		}

		if parseErr != nil {
			if firstError == nil {
				firstError = fmt.Errorf("kid %s: %w", k.Kid, parseErr)
			}
			fmt.Printf("Warning: failed to parse public key for kid %s: %v\n", k.Kid, parseErr)
			continue
		}
		if publicKey != nil {
			newKeys[k.Kid] = publicKey
		}
	}

	if len(newKeys) == 0 && firstError != nil {
		return nil, fmt.Errorf("no valid RSA keys found in JWKS, first error: %w", firstError)
	}
	if len(newKeys) == 0 {
		return nil, errors.New("no valid RSA keys found in JWKS")
	}

	m.cache.keys = newKeys
	m.cache.exp = time.Now().Add(defaultJwksCacheDuration)

	if refreshedKey, ok := m.cache.keys[kid]; ok {
		return refreshedKey, nil
	}

	return nil, fmt.Errorf("key ID '%s' not found in JWKS after refresh", kid)
}

// parseRSAPublicKeyFromModulusExponent constructs an RSA public key from base64url-encoded n and e.
func parseRSAPublicKeyFromModulusExponent(nStr, eStr string) (*rsa.PublicKey, error) {
	nBytes, err := base64.RawURLEncoding.DecodeString(nStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode modulus (n): %w", err)
	}

	eBytes, err := base64.RawURLEncoding.DecodeString(eStr)
	if err != nil {
		return nil, fmt.Errorf("failed to decode exponent (e): %w", err)
	}

	n := new(big.Int).SetBytes(nBytes)
	eVal := new(big.Int).SetBytes(eBytes)

	if !eVal.IsInt64() || eVal.Int64() < 0 || eVal.Int64() > int64(0x7FFFFFFF) {
		return nil, fmt.Errorf("exponent (e) value '%s' out of range for int", eVal.String())
	}

	return &rsa.PublicKey{
		N: n,
		E: int(eVal.Int64()),
	}, nil
}
