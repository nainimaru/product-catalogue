package middleware

import (
	"net/http"

	"github.com/nainimaru/product-catalogue/internal/models"
)

// ValidateProductRequest checks that all required fields are present
// in a ProductRequest. Returns true if valid, false if an error was written.
func ValidateProductRequest(w http.ResponseWriter, req models.ProductRequest) bool {
	if req.Title == "" {
		WriteError(w, http.StatusBadRequest, "title is required")
		return false
	}
	if req.Price <= 0 {
		WriteError(w, http.StatusBadRequest, "price must be greater than 0")
		return false
	}
	if len(req.Images) == 0 {
		WriteError(w, http.StatusBadRequest, "at least one image is required")
		return false
	}
	if req.Category.Name == "" {
		WriteError(w, http.StatusBadRequest, "category name is required")
		return false
	}

	return true
}

// ValidateEditProductRequest checks that the edit request has
// at least some fields to update, and that any provided values are valid.
// Returns the validation result and writes an error if invalid.
func ValidateEditProductRequest(w http.ResponseWriter, req models.EditProductRequest) bool {
	// Check if price is valid when provided
	if req.Price != nil && *req.Price <= 0 {
		WriteError(w, http.StatusBadRequest, "price must be greater than 0")
		return false
	}

	// Check if at least one field is provided
	hasFields := req.Title != nil ||
		req.Category != nil ||
		len(req.Images) > 0 ||
		req.Price != nil ||
		len(req.Tags) > 0 ||
		len(req.Specifications) > 0 ||
		req.Description != nil ||
		req.Brand != nil ||
		req.Stock != nil

	if !hasFields {
		WriteError(w, http.StatusBadRequest, "no fields to update")
		return false
	}

	return true
}

// ContentTypeJSON is a middleware that ensures the Content-Type header
// is set to application/json for POST, PUT, and PATCH requests.
func ContentTypeJSON(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost || r.Method == http.MethodPut || r.Method == http.MethodPatch {
			ct := r.Header.Get("Content-Type")
			if ct != "" && ct != "application/json" {
				WriteError(w, http.StatusUnsupportedMediaType, "Content-Type must be application/json")
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}
