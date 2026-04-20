package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
    "fmt"

	"github.com/go-chi/chi/v5"
	"github.com/nainimaru/product-catalogue/internals/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var productCollection, categoryCollection *mongo.Collection

func InitCollection(prodCol *mongo.Collection, catCol *mongo.Collection) {
	productCollection = prodCol
	categoryCollection = catCol
}

func GetProducts(w http.ResponseWriter, r *http.Request) {
	var products []models.Product

	cursor, err := productCollection.Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var product models.Product

		if err := cursor.Decode(&product); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		products = append(products, product)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(products)
}

type CategoryInput struct {
	Name   string `json:"name"`
	Gender string `json:"gender"`
}

// we created this struct to accept the user add product request because category sent by user is an string.
// Data structure corresponding to frontend request
type ProductRequest struct {
	Title       string            `json:"title"`
	Category    CategoryInput     `json:"category"` // Object from user, category and it's corresponding gender
	Images      []string          `json:"images"`
	Price       int               `json:"price"`
	Tags        []models.KeyValue `json:"tags"`
	Specifications       []models.KeyValue `json:"specifications"`
	Description string            `json:"description"`
	Brand       string            `json:"brand"`
	Stock       int               `json:"stock"`
}

func resolveCategory(ctx context.Context, name string, gender string) (primitive.ObjectID, error) {
	slug := strings.ToLower(strings.TrimSpace(name))

	var existing models.Category
	err := categoryCollection.FindOne(ctx, bson.M{
		"slug":   slug,
		"gender": gender,
	}).Decode(&existing)

	if err == nil {
		return existing.ID, nil
	}

	if err != mongo.ErrNoDocuments {
		return primitive.NilObjectID, err
	}

	newCat := models.Category{
		ID:     primitive.NewObjectID(),
		Name:   name,
		Slug:   slug,
		Gender: gender,
	}

	_, err = categoryCollection.InsertOne(ctx, newCat)
	if err != nil {
		return primitive.NilObjectID, err
	}

	return newCat.ID, nil
}

func AddProduct(w http.ResponseWriter, r *http.Request) {
	var req ProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid body", http.StatusBadRequest)
		return
	}

	// validations
	if req.Title == "" {
		http.Error(w, "title is required", http.StatusBadRequest)
		return
	}
	if req.Price <= 0 {
		http.Error(w, "price must be greater than 0", http.StatusBadRequest)
		return
	}
	if len(req.Images) == 0 {
		http.Error(w, "at least one image is required", http.StatusBadRequest)
		return
	}
	if req.Category.Name=="" {
		http.Error(w, "category is required", http.StatusBadRequest)
		return
	}

	// resolve category string -> ObjectID
	categoryID, err := resolveCategory(
		r.Context(),
		req.Category.Name,
		req.Category.Gender,
	)
	if err != nil {
		http.Error(w, "failed to resolve category", http.StatusInternalServerError)
		return
	}

	// build the model
	product := models.Product{
		Title:       req.Title,
		CategoryID:  categoryID,
		Images:      req.Images,
		Price:       req.Price,
		Tags:        req.Tags,
		Specifications:       req.Specifications,
		Description: req.Description,
		Brand:       req.Brand,
		Stock:       req.Stock,
	}

	result, err := productCollection.InsertOne(r.Context(), product)
	if err != nil {
		http.Error(w, "failed to save product", http.StatusInternalServerError)
		return
	}

	product.ID = result.InsertedID.(primitive.ObjectID)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(product)
}

// DeleteProduct handles DELETE /products/{id}
func DeleteProduct(w http.ResponseWriter, r *http.Request) {

	// chi.URLParam extracts the {id} from the route
	idStr := chi.URLParam(r, "id")

	// MongoDB needs ObjectID type, not plain string
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "invalid product id", http.StatusBadRequest)
		return
	}

	// DeleteOne finds the first document matching the filter and removes it
	result, err := productCollection.DeleteOne(r.Context(), bson.M{"_id": objectID})
	if err != nil {
		http.Error(w, "failed to delete product", http.StatusInternalServerError)
		return
	}

	// DeletedCount tells us if anything was actually deleted or not
	if result.DeletedCount == 0 {
		http.Error(w, "product not found", http.StatusNotFound)
		return
	}

	w.WriteHeader(http.StatusNoContent) // 204 — success, nothing to return
}

// EditProductRequest only contains fields the client is allowed to change.
// All fields are pointers - if a field is nil it means client didn't send it, skip it.
// If it's not a pointer, you can't distinguish between "client sent empty string" and "client didn't send this field at all"
type EditProductRequest struct {
	Title       *string           `json:"title"`
	Category    *CategoryInput    `json:"category"`
	Images      []string          `json:"images"`
	Price       *int              `json:"price"`
	Tags        []models.KeyValue `json:"tags"`
	Specifications       []models.KeyValue `json:"specifications"`
	Description *string           `json:"description"`
	Brand       *string           `json:"brand"`
	Stock       *int              `json:"stock"`
}

// EditProduct handles PATCH /products/{id}
func EditProduct(w http.ResponseWriter, r *http.Request) {

	// same ID extraction and validation as delete
	idStr := chi.URLParam(r, "id")
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "invalid product id", http.StatusBadRequest)
		return
	}

	// decode only what the client sent
	var req EditProductRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// bson.M is just a map — we'll only add fields to it that the client actually sent
	// $set tells MongoDB "only update these specific fields, leave everything else alone"
	updates := bson.M{}

	if req.Title != nil {
		updates["title"] = *req.Title
	}
	if req.Price != nil {
		if *req.Price <= 0 {
			http.Error(w, "price must be greater than 0", http.StatusBadRequest)
			return
		}
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

	// category comes in as a string, resolve it to ObjectID just like in AddProduct
	if req.Category != nil {
        categoryID, err := resolveCategory(
            r.Context(),
            req.Category.Name,
            req.Category.Gender,
        )
        if err != nil {
            http.Error(w, "failed to resolve category", http.StatusInternalServerError)
            return
        }
        updates["categoryId"] = categoryID
    }

	// if the client sent a body but all fields were empty/nil, nothing to do
	if len(updates) == 0 {
		http.Error(w, "no fields to update", http.StatusBadRequest)
		return
	}

	// FindOneAndUpdate finds the document, applies the update, and returns the updated document
	// ReturnDocument(options.After) means return the document AFTER the update, not before
	var updatedProduct models.Product
	err = productCollection.FindOneAndUpdate(
		r.Context(),
		bson.M{"_id": objectID}, // find by ID
		bson.M{"$set": updates}, // apply only the provided fields
		options.FindOneAndUpdate().SetReturnDocument(options.After),
	).Decode(&updatedProduct)

	if err == mongo.ErrNoDocuments {
		http.Error(w, "product not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "failed to update product", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedProduct)
}

func GetProductByID(w http.ResponseWriter, r *http.Request) {

	// extract and validate the product id from url
	idStr := chi.URLParam(r, "id")
	objectID, err := primitive.ObjectIDFromHex(idStr)
	if err != nil {
		http.Error(w, "invalid product id", http.StatusBadRequest)
		return
	}

	// find the product by id
	var product models.Product
	err = productCollection.FindOne(r.Context(), bson.M{"_id": objectID}).Decode(&product)
	if err == mongo.ErrNoDocuments {
		http.Error(w, "product not found", http.StatusNotFound)
		return
	}
	if err != nil {
		http.Error(w, "failed to fetch product", http.StatusInternalServerError)
		return
	}

	// find the category name using categoryId from the product
	var category models.Category
	err = categoryCollection.FindOne(r.Context(), bson.M{"_id": product.CategoryID}).Decode(&category)
	if err != nil && err != mongo.ErrNoDocuments {
		// if category is not found we don't stop - product still gets returned
		// we only stop if something actually broke
		http.Error(w, "failed to fetch category", http.StatusInternalServerError)
		return
	}

	// build a response struct that combines product + category name
	response := struct {
    models.Product
    Category struct {
        Name   string `json:"name"`
        Gender string `json:"gender"`
    } `json:"category"`
    }{
        Product: product,
        Category: struct {
            Name   string `json:"name"`
            Gender string `json:"gender"`
        }{
            Name:   category.Name,
            Gender: category.Gender,
        },
    }

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}


func GetCategories(w http.ResponseWriter, r *http.Request) {
	var categories []models.Category

	cursor, err := categoryCollection.Find(context.Background(), bson.M{})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var cat models.Category
		if err := cursor.Decode(&cat); err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		categories = append(categories, cat)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(categories)
}