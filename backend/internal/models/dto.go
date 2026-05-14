package models

// CategoryInput represents the category data sent by the frontend.
type CategoryInput struct {
	Name   string `json:"name"`
	Gender string `json:"gender"`
}

// ProductRequest is the request body for creating a new product.
// Category comes as an object (name + gender) from the frontend,
// which gets resolved to an ObjectID by the service layer.
type ProductRequest struct {
	Title          string     `json:"title"`
	Category       CategoryInput `json:"category"`
	Images         []string   `json:"images"`
	Price          int        `json:"price"`
	Tags           []KeyValue `json:"tags"`
	Specifications []KeyValue `json:"specifications"`
	Description    string     `json:"description"`
	Brand          string     `json:"brand"`
	Stock          int        `json:"stock"`
}

// EditProductRequest is the request body for updating a product.
// All fields are pointers so we can distinguish between
// "field not sent" (nil) vs "field sent as empty/zero".
type EditProductRequest struct {
	Title          *string        `json:"title"`
	Category       *CategoryInput `json:"category"`
	Images         []string       `json:"images"`
	Price          *int           `json:"price"`
	Tags           []KeyValue     `json:"tags"`
	Specifications []KeyValue     `json:"specifications"`
	Description    *string        `json:"description"`
	Brand          *string        `json:"brand"`
	Stock          *int           `json:"stock"`
}

// ProductListResponse is the paginated response for listing products.
type ProductListResponse struct {
	Data  []Product `json:"data"`
	Total int64     `json:"total"`
	Page  int       `json:"page"`
	Limit int       `json:"limit"`
}

// ProductDetailResponse combines a product with its resolved category info.
type ProductDetailResponse struct {
	Product
	Category CategoryInput `json:"category"`
}
