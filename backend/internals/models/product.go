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

//example of product
// {
// "title":"BATA formal leather slip on shoe",
// "categoryId": "5a566kcnf3kdn989cvf8n",
// "images": "https://plus.unsplash.com/premium_photo-1705554330163-2e0ccc1808e2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9ybWFsJTIwc2hvZXN8ZW58MHx8MHx8fDA%3D",
// "price": 2999,
// "tags":[{"key":"Color", "value":"Light Brown"}, {"key":"Size", "value":"XIA"}],
// "highlights":[{"key":"outer material", "value":"Leather"}, {"key":"Occasion","value":"Formal"},{"key":"Type for formal", "value":"No lace"}],
// "specifications":[{"key":"Brand", "value":"Bata"},{ "key":"Brand Color", "value":"Light Brown"}, {"key":"Shoe Type", "value":"Walking Shoes, Corporate Casuals"}],
// "Description":"Bata provides one of the best quality police shoes in the industry and all shoes are made in pure and original leather. Leather's natural breathability allows for proper ventilation, Leather Shoes offer insulation in cold weather while allowing heat dissipation in warmer conditions, maintaining optimal foot temperature.",
// "stock":"70"
// }
