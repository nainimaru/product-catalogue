package app

import (
	"fmt"

	"github.com/nainimaru/product-catalogue/internal/handlers"
	"github.com/nainimaru/product-catalogue/internal/repository"
	"github.com/nainimaru/product-catalogue/internal/services"
	"go.mongodb.org/mongo-driver/mongo"
)

// Application holds all the dependencies for the application.
// It wires up the layers: repository → service → handler.
type Application struct {
	ProductHandler  *handlers.ProductHandler
	CategoryHandler *handlers.CategoryHandler
	MongoDB         *mongo.Client
}

// NewApplication connects to the database and wires up all layers.
// This is the single place where dependency injection happens —
// no global variables, no init() functions.
func NewApplication() (*Application, error) {
	// 1. Connect to database
	mongoDB, err := repository.ConnectDB()
	if err != nil {
		return nil, fmt.Errorf("database connection failed: %w", err)
	}

	// 2. Create repositories
	productRepo := repository.NewProductRepository(mongoDB)
	categoryRepo := repository.NewCategoryRepository(mongoDB)

	// 3. Create services (depend on repositories)
	productService := services.NewProductService(productRepo, categoryRepo)
	categoryService := services.NewCategoryService(categoryRepo)

	// 4. Create handlers (depend on services)
	productHandler := handlers.NewProductHandler(productService)
	categoryHandler := handlers.NewCategoryHandler(categoryService)

	return &Application{
		ProductHandler:  productHandler,
		CategoryHandler: categoryHandler,
		MongoDB:         mongoDB,
	}, nil
}
