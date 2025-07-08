package rate_limiter

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// IPRateLimiter holds the rate limiters for each IP address.
type IPRateLimiter struct {
	visitors map[string]*visitor
	mu       sync.Mutex
	r        rate.Limit
	b        int
	cancel   context.CancelFunc
}

// visitor holds the limiter and cooldown information for a given IP.
type visitor struct {
	limiter       *rate.Limiter
	lastSeen      time.Time
	cooldownUntil time.Time
}

const cooldownDuration = 1 * time.Minute
const cleanupInterval = 5 * time.Minute

// NewIPRateLimiter initializes a new rate limiter.
func NewIPRateLimiter(r rate.Limit, b int) *IPRateLimiter {
	ctx, cancel := context.WithCancel(context.Background())

	limiter := &IPRateLimiter{
		visitors: make(map[string]*visitor),
		r:        r,
		b:        b,
		cancel:   cancel,
	}

	// Periodically clean up old entries from the visitors map.
	go limiter.cleanupVisitors(ctx)

	return limiter
}

// Middleware is the Gin middleware for rate limiting with a cooldown.
func (limiter *IPRateLimiter) Middleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()
		limiter.mu.Lock()

		v, exists := limiter.visitors[ip]
		if !exists {
			v = &visitor{limiter: rate.NewLimiter(limiter.r, limiter.b)}
			limiter.visitors[ip] = v
		}
		v.lastSeen = time.Now()

		// Check if the user is in a cooldown period.
		if !v.cooldownUntil.IsZero() && time.Now().Before(v.cooldownUntil) {
			limiter.mu.Unlock()
			retryAfter := time.Until(v.cooldownUntil).Seconds()
			c.Header("Retry-After", fmt.Sprintf("%.0f", retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "You are temporarily blocked. Please try again later."})
			return
		}

		// If cooldown has passed, reset it.
		v.cooldownUntil = time.Time{}

		if !v.limiter.Allow() {
			v.cooldownUntil = time.Now().Add(cooldownDuration)
			limiter.mu.Unlock()
			c.Header("Retry-After", fmt.Sprintf("%.0f", cooldownDuration.Seconds()))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{"error": "Rate limit exceeded. You are temporarily blocked."})
			return
		}

		limiter.mu.Unlock()
		c.Next()
	}
}

// cleanupVisitors removes entries that haven't been seen for a while.
func (limiter *IPRateLimiter) cleanupVisitors(ctx context.Context) {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			// Context was cancelled, stop the goroutine.
			return
		case <-ticker.C:
			// Timer ticked, perform cleanup.
			limiter.mu.Lock()
			for ip, v := range limiter.visitors {
				if time.Since(v.lastSeen) > cleanupInterval {
					delete(limiter.visitors, ip)
				}
			}
			limiter.mu.Unlock()
		}
	}
}
