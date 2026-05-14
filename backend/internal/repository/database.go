package repository

import (
	"context"
	"fmt"
	"os"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

const databaseName = "product_catalogue"

// ConnectDB reads MONGODB_URI from the environment and returns
// a connected MongoDB client. The caller is responsible for
// disconnecting the client when the application shuts down.
func ConnectDB() (*mongo.Client, error) {
	uri := os.Getenv("MONGODB_URI")
	if uri == "" {
		return nil, fmt.Errorf("MONGODB_URI environment variable is not set")
	}

	clientOptions := options.Client().ApplyURI(uri)

	client, err := mongo.Connect(context.Background(), clientOptions)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to MongoDB: %w", err)
	}

	if err = client.Ping(context.Background(), nil); err != nil {
		return nil, fmt.Errorf("failed to ping MongoDB: %w", err)
	}

	return client, nil
}
