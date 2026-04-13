package handlers

import (
	"context"

	"github.com/gofiber/fiber/v2"
	"github.com/nainimaru/product-catalogue/internals/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

var collection *mongo.Collection

func InitCollection(col *mongo.Collection) {
	collection = col
}

func GetProducts(c *fiber.Ctx) error {
	var products []models.Product

	cursor, err := collection.Find(context.Background(), bson.M{})

	if err != nil {
		return err
	}

	for cursor.Next(context.Background()) {
		var product models.Product
		if err := cursor.Decode(&product); err != nil {
			return err
		}
		products = append(products, product)
	}
	return c.Status(200).JSON(products)
}

func AddProduct(c *fiber.Ctx) error {
	product := new(models.Product)

	if err := c.BodyParser(product); err != nil {
		return err
	}

	if product.Price <= 0 {
		return c.Status(400).JSON(fiber.Map{"error": "price is required"})
	}

	if len(product.Images) == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "atleast one image is required"})
	}

	if product.Title == "" {
		return c.Status(400).JSON(fiber.Map{"error": "title is required"})
	}

	insertResult, err := collection.InsertOne(context.Background(), product)

	if err != nil {
		return err
	}

	product.ID = insertResult.InsertedID.(primitive.ObjectID)

	return c.Status(201).JSON(product)
}
