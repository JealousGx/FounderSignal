package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/golang-jwt/jwt/v5"
)

type TokenAuthenticator interface {
	ValidateToken(ctx context.Context, tokenString string) (userID string, err error)
}

// ClerkTokenAuthenticator validates tokens using Clerk's JWKS via JWKSManager.
type ClerkTokenAuthenticator struct {
	jwksManager *JWKSManager
	// You can add expected issuer or audience here if needed for stricter validation
	// expectedIssuer string
}

// NewClerkTokenAuthenticator creates a new authenticator.
// jwksURL is the URL to fetch Clerk's JSON Web Key Set.
func NewClerkTokenAuthenticator(jwksURL string) TokenAuthenticator {
	return &ClerkTokenAuthenticator{
		jwksManager: NewJWKSManager(jwksURL),
		// expectedIssuer: "clerk-issuer-url", // Example
	}
}

// ValidateToken parses and validates the JWT token string.
// It returns the userID (from "sub" claim) if the token is valid.
func (a *ClerkTokenAuthenticator) ValidateToken(ctx context.Context, tokenString string) (string, error) {
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		kid, ok := token.Header["kid"].(string)
		if !ok {
			return nil, errors.New("kid header not found in token")
		}

		return a.jwksManager.GetPublicKey(ctx, kid)
	})

	if err != nil {
		// Check for specific JWT errors to provide better feedback
		if errors.Is(err, jwt.ErrTokenExpired) {
			return "", errors.New("token has expired")
		}
		if errors.Is(err, jwt.ErrTokenNotValidYet) {
			return "", errors.New("token not yet valid")
		}
		// Add more specific error checks if needed
		return "", fmt.Errorf("token validation failed: %w", err)
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return "", errors.New("invalid token or claims")
	}

	userID, ok := claims["sub"].(string)
	if !ok {
		return "", errors.New("subject (userID) not found in token claims")
	}

	return userID, nil
}
