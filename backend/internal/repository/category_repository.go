package repository

import (
	"context"

	"github.com/nainimaru/product-catalogue/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// CategoryRepository handles all MongoDB operations for the categories collection.
type CategoryRepository struct {
	collection *mongo.Collection
}

// NewCategoryRepository creates a new CategoryRepository using the given client.
func NewCategoryRepository(client *mongo.Client) *CategoryRepository {
	return &CategoryRepository{
		collection: client.Database(databaseName).Collection("categories"),
	}
}

// FindAll returns all categories.
func (r *CategoryRepository) FindAll(ctx context.Context) ([]models.Category, error) {
	cursor, err := r.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	for cursor.Next(ctx) {
		var cat models.Category
		if err := cursor.Decode(&cat); err != nil {
			return nil, err
		}
		categories = append(categories, cat)
	}

	return categories, nil
}

// FindByID returns a single category by its ObjectID.
func (r *CategoryRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Category, error) {
	var category models.Category
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&category)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindBySlugAndGender finds a category matching the given slug and gender.
func (r *CategoryRepository) FindBySlugAndGender(ctx context.Context, slug, gender string) (*models.Category, error) {
	var category models.Category
	err := r.collection.FindOne(ctx, bson.M{
		"slug":   slug,
		"gender": gender,
	}).Decode(&category)
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// FindByGender returns all category IDs matching the given gender.
func (r *CategoryRepository) FindByGender(ctx context.Context, gender string) ([]primitive.ObjectID, error) {
	cursor, err := r.collection.Find(ctx, bson.M{"gender": gender})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var ids []primitive.ObjectID
	for cursor.Next(ctx) {
		var c models.Category
		if err := cursor.Decode(&c); err != nil {
			return nil, err
		}
		ids = append(ids, c.ID)
	}

	return ids, nil
}

// InsertOne inserts a new category document.
func (r *CategoryRepository) InsertOne(ctx context.Context, category models.Category) error {
	_, err := r.collection.InsertOne(ctx, category)
	return err
}
