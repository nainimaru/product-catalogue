package handlers

import (
	"net/http"

	"github.com/nainimaru/product-catalogue/internal/middleware"
	"github.com/nainimaru/product-catalogue/internal/models"
	"github.com/nainimaru/product-catalogue/internal/services"
	"go.mongodb.org/mongo-driver/mongo"
)

// ProductHandler handles HTTP requests for product endpoints.
// It only deals with HTTP concerns: reading params/body and writing responses.
// All business logic is delegated to the ProductService.
type ProductHandler struct {
	service *services.ProductService
}

// NewProductHandler creates a new ProductHandler with its service dependency.
func NewProductHandler(service *services.ProductService) *ProductHandler {
	return &ProductHandler{service: service}
}

// GetProducts handles GET /products
func (h *ProductHandler) GetProducts(w http.ResponseWriter, r *http.Request) {
	page := middleware.ReadQueryInt(r, "page", 1)
	limit := middleware.ReadQueryInt(r, "limit", 6)
	gender := middleware.ReadQueryString(r, "gender")
	category := middleware.ReadQueryString(r, "category")
	search := middleware.ReadQueryString(r, "search")
	sortBy := middleware.ReadQueryString(r, "sortBy")
	order := middleware.ReadQueryString(r, "order")

	response, err := h.service.GetProducts(r.Context(), page, limit, gender, category, search, sortBy, order)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch products")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, response)
}

// GetProductByID handles GET /products/{id}
func (h *ProductHandler) GetProductByID(w http.ResponseWriter, r *http.Request) {
	id, ok := middleware.ReadIDParam(w, r)
	if !ok {
		return
	}

	response, err := h.service.GetProductByID(r.Context(), id)
	if err == mongo.ErrNoDocuments {
		middleware.WriteError(w, http.StatusNotFound, "product not found")
		return
	}
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to fetch product")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, response)
}

// AddProduct handles POST /products
func (h *ProductHandler) AddProduct(w http.ResponseWriter, r *http.Request) {
	var req models.ProductRequest
	if !middleware.ReadBody(w, r, &req) {
		return
	}

	if !middleware.ValidateProductRequest(w, req) {
		return
	}

	product, err := h.service.AddProduct(r.Context(), req)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to save product")
		return
	}

	middleware.WriteJSON(w, http.StatusCreated, product)
}

// EditProduct handles PATCH /products/{id}
func (h *ProductHandler) EditProduct(w http.ResponseWriter, r *http.Request) {
	id, ok := middleware.ReadIDParam(w, r)
	if !ok {
		return
	}

	var req models.EditProductRequest
	if !middleware.ReadBody(w, r, &req) {
		return
	}

	if !middleware.ValidateEditProductRequest(w, req) {
		return
	}

	updated, err := h.service.EditProduct(r.Context(), id, req)
	if err == mongo.ErrNoDocuments {
		middleware.WriteError(w, http.StatusNotFound, "product not found")
		return
	}
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to update product")
		return
	}

	middleware.WriteJSON(w, http.StatusOK, updated)
}

// DeleteProduct handles DELETE /products/{id}
func (h *ProductHandler) DeleteProduct(w http.ResponseWriter, r *http.Request) {
	id, ok := middleware.ReadIDParam(w, r)
	if !ok {
		return
	}

	count, err := h.service.DeleteProduct(r.Context(), id)
	if err != nil {
		middleware.WriteError(w, http.StatusInternalServerError, "failed to delete product")
		return
	}

	if count == 0 {
		middleware.WriteError(w, http.StatusNotFound, "product not found")
		return
	}

	w.WriteHeader(http.StatusNoContent)
}
