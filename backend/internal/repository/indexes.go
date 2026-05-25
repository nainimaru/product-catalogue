package repository

import (
	"context"
	"fmt"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// CreateIndexes creates MongoDB indexes for faster queries.
func CreateIndexes(client *mongo.Client) error {
	productCollection := client.Database(databaseName).Collection("products")
	categoryCollection := client.Database(databaseName).Collection("categories")

	// Product indexes
	productIndexes := []mongo.IndexModel{

		// Search by title
		{
			Keys: bson.D{
				{Key: "title", Value: "text"},
			},
		},

		// Filter by category
		{
			Keys: bson.D{
				{Key: "categoryId", Value: 1},
			},
		},

		// Sort by price
		{
			Keys: bson.D{
				{Key: "price", Value: 1},
			},
		},

		// Filter category + sort price
		{
			Keys: bson.D{
				{Key: "categoryId", Value: 1},
				{Key: "price", Value: 1},
			},
		},
	}

	// Category indexes
	categoryIndexes := []mongo.IndexModel{

		// Gender filter
		{
			Keys: bson.D{
				{Key: "gender", Value: 1},
			},
		},

		// Unique slug + gender
		{
			Keys: bson.D{
				{Key: "slug", Value: 1},
				{Key: "gender", Value: 1},
			},
		},
	}

	_, err := productCollection.Indexes().CreateMany(context.Background(), productIndexes)
	if err != nil {
		return fmt.Errorf("failed creating product indexes: %w", err)
	}

	_, err = categoryCollection.Indexes().CreateMany(context.Background(), categoryIndexes)
	if err != nil {
		return fmt.Errorf("failed creating category indexes: %w", err)
	}

	return nil
}