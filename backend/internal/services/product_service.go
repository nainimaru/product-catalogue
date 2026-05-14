package services

import (
	"context"
	"strings"

	"github.com/nainimaru/product-catalogue/internal/models"
	"github.com/nainimaru/product-catalogue/internal/repository"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ProductService contains the business logic for product operations.
type ProductService struct {
	productRepo  *repository.ProductRepository
	categoryRepo *repository.CategoryRepository
}

// NewProductService creates a new ProductService with its dependencies.
func NewProductService(productRepo *repository.ProductRepository, categoryRepo *repository.CategoryRepository) *ProductService {
	return &ProductService{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
	}
}

// GetProducts returns a paginated, filtered, and sorted list of products.
func (s *ProductService) GetProducts(ctx context.Context, page, limit int, gender, category, search, sortBy, order string) (*models.ProductListResponse, error) {
	skip := (page - 1) * limit
	filter := bson.M{}

	// Build category filter from gender or specific category ID
	categoryIDs, err := s.resolveCategoryFilter(ctx, gender, category)
	if err != nil {
		return nil, err
	}
	if len(categoryIDs) > 0 {
		filter["categoryId"] = bson.M{"$in": categoryIDs}
	}

	// Search by title
	if search != "" {
		filter["title"] = bson.M{
			"$regex":   search,
			"$options": "i",
		}
	}

	// Build sort options
	sort := bson.D{}
	if sortBy != "" {
		sortOrder := 1
		if order == "desc" {
			sortOrder = -1
		}
		sort = append(sort, bson.E{Key: sortBy, Value: sortOrder})
	}

	// Count total matching documents
	total, err := s.productRepo.CountDocuments(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Fetch paginated results
	opts := options.Find().
		SetSkip(int64(skip)).
		SetLimit(int64(limit)).
		SetSort(sort)

	products, err := s.productRepo.FindAll(ctx, filter, opts)
	if err != nil {
		return nil, err
	}

	// Ensure we return an empty array instead of null in JSON
	if products == nil {
		products = []models.Product{}
	}

	return &models.ProductListResponse{
		Data:  products,
		Total: total,
		Page:  page,
		Limit: limit,
	}, nil
}

// GetProductByID returns a product with its resolved category information.
func (s *ProductService) GetProductByID(ctx context.Context, id primitive.ObjectID) (*models.ProductDetailResponse, error) {
	product, err := s.productRepo.FindByID(ctx, id)
	if err != nil {
		return nil, err
	}

	// Resolve category name and gender
	var catInput models.CategoryInput
	cat, err := s.categoryRepo.FindByID(ctx, product.CategoryID)
	if err == nil {
		catInput = models.CategoryInput{Name: cat.Name, Gender: cat.Gender}
	}
	// If category not found, we still return the product with empty category info

	return &models.ProductDetailResponse{
		Product:  *product,
		Category: catInput,
	}, nil
}

// AddProduct validates the request, resolves the category, and inserts a new product.
func (s *ProductService) AddProduct(ctx context.Context, req models.ProductRequest) (*models.Product, error) {
	categoryID, err := s.resolveCategory(ctx, req.Category.Name, req.Category.Gender)
	if err != nil {
		return nil, err
	}

	product := models.Product{
		Title:          req.Title,
		CategoryID:     categoryID,
		Images:         req.Images,
		Price:          req.Price,
		Tags:           req.Tags,
		Specifications: req.Specifications,
		Description:    req.Description,
		Brand:          req.Brand,
		Stock:          req.Stock,
	}

	insertedID, err := s.productRepo.InsertOne(ctx, product)
	if err != nil {
		return nil, err
	}

	product.ID = insertedID
	return &product, nil
}

// EditProduct updates only the fields provided in the request.
func (s *ProductService) EditProduct(ctx context.Context, id primitive.ObjectID, req models.EditProductRequest) (*models.Product, error) {
	updates := bson.M{}

	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Price != nil {
		updates["price"] = *req.Price
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Brand != nil {
		updates["brand"] = *req.Brand
	}
	if req.Stock != nil {
		updates["stock"] = *req.Stock
	}
	if len(req.Images) > 0 {
		updates["images"] = req.Images
	}
	if len(req.Tags) > 0 {
		updates["tags"] = req.Tags
	}
	if len(req.Specifications) > 0 {
		updates["specifications"] = req.Specifications
	}

	// Resolve category if provided
	if req.Category != nil {
		categoryID, err := s.resolveCategory(ctx, req.Category.Name, req.Category.Gender)
		if err != nil {
			return nil, err
		}
		updates["categoryId"] = categoryID
	}

	return s.productRepo.FindOneAndUpdate(ctx, id, updates)
}

// DeleteProduct removes a product by ID. Returns the number of deleted documents.
func (s *ProductService) DeleteProduct(ctx context.Context, id primitive.ObjectID) (int64, error) {
	return s.productRepo.DeleteOne(ctx, id)
}

// resolveCategory finds an existing category by slug+gender or creates a new one.
func (s *ProductService) resolveCategory(ctx context.Context, name, gender string) (primitive.ObjectID, error) {
	slug := strings.ToLower(strings.TrimSpace(name))

	existing, err := s.categoryRepo.FindBySlugAndGender(ctx, slug, gender)
	if err == nil {
		return existing.ID, nil
	}

	if err != mongo.ErrNoDocuments {
		return primitive.NilObjectID, err
	}

	// Create new category
	newCat := models.Category{
		ID:     primitive.NewObjectID(),
		Name:   name,
		Slug:   slug,
		Gender: gender,
	}

	if err := s.categoryRepo.InsertOne(ctx, newCat); err != nil {
		return primitive.NilObjectID, err
	}

	return newCat.ID, nil
}

// resolveCategoryFilter builds category ID filter from gender and/or specific category.
func (s *ProductService) resolveCategoryFilter(ctx context.Context, gender, category string) ([]primitive.ObjectID, error) {
	var categoryIDs []primitive.ObjectID

	// If gender is specified, get all category IDs for that gender
	if gender != "" {
		ids, err := s.categoryRepo.FindByGender(ctx, gender)
		if err != nil {
			return nil, err
		}
		categoryIDs = ids
	}

	// If a specific category is selected, override to only that
	if category != "" {
		catID, err := primitive.ObjectIDFromHex(category)
		if err == nil {
			categoryIDs = []primitive.ObjectID{catID}
		}
	}

	return categoryIDs, nil
}
