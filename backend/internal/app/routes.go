package app

import (
	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/nainimaru/product-catalogue/internal/middleware"
)

// SetupRoutes creates the chi router and registers all routes.
func SetupRoutes(app *Application) *chi.Mux {
	r := chi.NewRouter()

	// Global middleware stack
	r.Use(chimiddleware.Logger)      // Log every request: method, path, status, duration
	r.Use(middleware.Recover)        // Catch panics → return 500 JSON instead of crashing
	r.Use(middleware.ContentTypeJSON) // Validate Content-Type for POST/PUT/PATCH

	// Product routes
	r.Get("/products", app.ProductHandler.GetProducts)
	r.Post("/products", app.ProductHandler.AddProduct)
	r.Get("/products/{id}", app.ProductHandler.GetProductByID)
	r.Patch("/products/{id}", app.ProductHandler.EditProduct)
	r.Delete("/products/{id}", app.ProductHandler.DeleteProduct)

	// Category routes
	r.Get("/categories", app.CategoryHandler.GetCategories)

	return r
}
