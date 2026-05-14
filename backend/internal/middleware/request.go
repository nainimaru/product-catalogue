package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ReadIDParam extracts the "{id}" URL parameter from a chi route
// and converts it to a MongoDB ObjectID.
// Returns an error response and false if the ID is missing or invalid.
func ReadIDParam(w http.ResponseWriter, r *http.Request) (primitive.ObjectID, bool) {
	idStr := chi.URLParam(r, "id")
	if idStr == "" {
		WriteError(w, http.StatusBadRequest, "missing id parameter")
		return primitive.NilObjectID, false
	}

	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "invalid id format")
		return primitive.NilObjectID, false
	}

	return objectID, true
}

// ReadBody decodes the JSON request body into the given destination.
// Returns an error response and false if the body is invalid JSON.
func ReadBody(w http.ResponseWriter, r *http.Request, dest interface{}) bool {
	if r.Body == nil {
		WriteError(w, http.StatusBadRequest, "request body is empty")
		return false
	}

	if err := json.NewDecoder(r.Body).Decode(dest); err != nil {
		WriteError(w, http.StatusBadRequest, fmt.Sprintf("invalid request body: %s", err.Error()))
		return false
	}

	return true
}

// ReadQueryInt reads an integer query parameter with a default fallback.
// Example: ReadQueryInt(r, "page", 1) returns the "page" param or 1 if missing.
func ReadQueryInt(r *http.Request, key string, defaultVal int) int {
	val := r.URL.Query().Get(key)
	if val == "" {
		return defaultVal
	}

	num, err := strconv.Atoi(val)
	if err != nil {
		return defaultVal
	}

	return num
}

// ReadQueryString reads a string query parameter, returning empty string if not present.
func ReadQueryString(r *http.Request, key string) string {
	return r.URL.Query().Get(key)
}
