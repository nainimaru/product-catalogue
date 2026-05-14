package middleware

import (
	"fmt"
	"net/http"
	"runtime/debug"
)

// Recover catches any panics in downstream handlers and converts them
// into a 500 JSON error response instead of crashing the server.
// This satisfies the "No panic / unhandled promise rejections" coding standard.
func Recover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if err := recover(); err != nil {
				// Log the stack trace for debugging
				fmt.Printf("[PANIC RECOVERED] %v\n%s\n", err, debug.Stack())

				WriteError(w, http.StatusInternalServerError, "an unexpected error occurred")
			}
		}()

		next.ServeHTTP(w, r)
	})
}
