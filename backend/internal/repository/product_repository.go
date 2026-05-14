package repository

import (
	"context"

	"github.com/nainimaru/product-catalogue/internal/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// ProductRepository handles all MongoDB operations for the products collection.
type ProductRepository struct {
	collection *mongo.Collection
}

// NewProductRepository creates a new ProductRepository using the given client.
func NewProductRepository(client *mongo.Client) *ProductRepository {
	return &ProductRepository{
		collection: client.Database(databaseName).Collection("products"),
	}
}

// CountDocuments returns the number of documents matching the filter.
func (r *ProductRepository) CountDocuments(ctx context.Context, filter bson.M) (int64, error) {
	return r.collection.CountDocuments(ctx, filter)
}

// FindAll returns products matching the filter with the given find options (pagination, sort).
func (r *ProductRepository) FindAll(ctx context.Context, filter bson.M, opts *options.FindOptions) ([]models.Product, error) {
	cursor, err := r.collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var products []models.Product
	for cursor.Next(ctx) {
		var product models.Product
		if err := cursor.Decode(&product); err != nil {
			return nil, err
		}
		products = append(products, product)
	}

	return products, nil
}

// FindByID returns a single product by its ObjectID.
func (r *ProductRepository) FindByID(ctx context.Context, id primitive.ObjectID) (*models.Product, error) {
	var product models.Product
	err := r.collection.FindOne(ctx, bson.M{"_id": id}).Decode(&product)
	if err != nil {
		return nil, err
	}
	return &product, nil
}

// InsertOne inserts a new product and returns the generated ObjectID.
func (r *ProductRepository) InsertOne(ctx context.Context, product models.Product) (primitive.ObjectID, error) {
	result, err := r.collection.InsertOne(ctx, product)
	if err != nil {
		return primitive.NilObjectID, err
	}
	return result.InsertedID.(primitive.ObjectID), nil
}

// DeleteOne deletes a product by ID and returns the count of deleted documents.
func (r *ProductRepository) DeleteOne(ctx context.Context, id primitive.ObjectID) (int64, error) {
	result, err := r.collection.DeleteOne(ctx, bson.M{"_id": id})
	if err != nil {
		return 0, err
	}
	return result.DeletedCount, nil
}

// FindOneAndUpdate updates a product by ID and returns the updated document.
func (r *ProductRepository) FindOneAndUpdate(ctx context.Context, id primitive.ObjectID, updates bson.M) (*models.Product, error) {
	var updated models.Product
	err := r.collection.FindOneAndUpdate(
		ctx,
		bson.M{"_id": id},
		bson.M{"$set": updates},
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updated)
	if err != nil {
		return nil, err
	}
	return &updated, nil
}
