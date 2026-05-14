package middleware

import (
	"encoding/json"
	"net/http"
)

// ErrorResponse is the standard JSON error body returned by all endpoints.
type ErrorResponse struct {
	Error  string `json:"error"`
	Status int    `json:"status"`
}

// WriteJSON writes a JSON response with the given status code and payload.
func WriteJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// WriteError writes a standardized JSON error response.
func WriteError(w http.ResponseWriter, status int, message string) {
	WriteJSON(w, status, ErrorResponse{
		Error:  message,
		Status: status,
	})
}
