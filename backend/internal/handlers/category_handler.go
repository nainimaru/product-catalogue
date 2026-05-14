package handlers

import (
	"net/http"

	"github.com/nainimaru/product-catalogue/internal/middleware"
	"github.com/nainimaru/product-catalogue/internal/services"
)

// CategoryHandler handles HTTP requests for category endpoints.
type CategoryHandler struct {
	service *services.CategoryService
}

// NewCategoryHandler creates a new CategoryHandler with its service dependency.
func NewCategoryHandler(service *services.CategoryService) *CategoryHandler {
	return &CategoryHandler{service: service}
}

// GetCategories handles GET /categories
func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	categories, err := h.service.GetCategories(r.Context())
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch categories")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, categories)
}
