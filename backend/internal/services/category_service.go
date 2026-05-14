package services

import (
	"context"

	"github.com/nainimaru/product-catalogue/internal/models"
	"github.com/nainimaru/product-catalogue/internal/repository"
)

// CategoryService contains the business logic for category operations.
type CategoryService struct {
	categoryRepo *repository.CategoryRepository
}

// NewCategoryService creates a new CategoryService with its dependencies.
func NewCategoryService(categoryRepo *repository.CategoryRepository) *CategoryService {
	return &CategoryService{
		categoryRepo: categoryRepo,
	}
}

// GetCategories returns all categories.
func (s *CategoryService) GetCategories(ctx context.Context) ([]models.Category, error) {
	categories, err := s.categoryRepo.FindAll(ctx)
	if err != nil {
		return nil, err
	}

	// Return empty array instead of null in JSON
	if categories == nil {
		categories = []models.Category{}
	}

	return categories, nil
}
