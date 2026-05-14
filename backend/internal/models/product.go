package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type KeyValue struct {
	Key   string `json:"key" bson:"key"`
	Value string `json:"value" bson:"value"`
}

type Product struct {
	ID             primitive.ObjectID `json:"id,omitempty" bson:"_id,omitempty"`
	Title          string             `json:"title" bson:"title"`
	CategoryID     primitive.ObjectID `json:"categoryId" bson:"categoryId"`
	Images         []string           `json:"images" bson:"images"`
	Price          int                `json:"price" bson:"price"`
	Tags           []KeyValue         `json:"tags" bson:"tags"`
	Specifications []KeyValue         `json:"specifications" bson:"specifications"`
	Description    string             `json:"description" bson:"description"`
	Brand          string             `json:"brand" bson:"brand"`
	Stock          int                `json:"stock" bson:"stock"`
}
