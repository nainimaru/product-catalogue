package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"github.com/nainimaru/product-catalogue/internals/handlers"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var collection *mongo.Collection

func main() {
	fmt.Println("Product Catalogue")

	//Loading environment variables
	err := godotenv.Load(".env")

	//if Loading fails then terminate the execution
	if err != nil {
		log.Fatal("error while loading env vairables", err)
	}

	//os.Getenv loads environment variables, Loads MONGODB_URI if it exists
	MONGODB_URI := os.Getenv("MONGODB_URI")

	//creating mongoDB client configurations using MONGODB_URI(connection string)
	clientOptions := options.Client().ApplyURI(MONGODB_URI)

	//mongo.Connect tries to establish connection
	client, err := mongo.Connect(context.Background(), clientOptions)

	//if connection fails -> stop program
	if err != nil {
		log.Fatal(err)
	}

	//Ping confirms network is fine
	err = client.Ping(context.Background(), nil)

	//if ping fails stop program connection is useless
	if err != nil {
		log.Fatal("error when we ping DB", err)
	}

	//message on terminal that mongoDB is connected
	fmt.Println("connected to mongoDB")

	collection = client.Database("product_catalogue").Collection("products")
	handlers.InitCollection(collection)
	app := fiber.New()

	app.Get("/products", handlers.GetProducts)
	app.Post("/products", handlers.AddProduct)

	log.Fatal(app.Listen(":5000"))
}
