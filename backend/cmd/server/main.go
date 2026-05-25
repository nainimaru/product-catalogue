package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/joho/godotenv"
	"github.com/nainimaru/product-catalogue/internal/app"
	"github.com/nainimaru/product-catalogue/internal/middleware"
	httpSwagger "github.com/swaggo/http-swagger/v2"
)

func main() {
	// Load environment variables from .env file
	// Try multiple paths so it works whether you run from backend/ or backend/cmd/server/
	_ = godotenv.Load()          // looks in current directory
	_ = godotenv.Load("../../.env") // looks in backend/ when running from cmd/server/

	// Create the application — this wires up DB, repositories, services, and handlers
	application, err := app.NewApplication()
	if err != nil {
		log.Fatalf("failed to initialize application: %v", err)
	}
	fmt.Println("connected to MongoDB")

	// Set up routes
	router := app.SetupRoutes(application)

	router.Get("/swagger/doc.yaml", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/x-yaml")
		http.ServeFile(w, r, "docs/swagger.yaml")
	})

	router.Get("/swagger/*", httpSwagger.Handler(
		httpSwagger.URL("/swagger/doc.yaml"),
	))

	// Determine allowed origin for CORS
	allowedOrigin := os.Getenv("CORS_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:5173"
	}

	// Determine port
	port := os.Getenv("PORT")
	if port == "" {
		port = "5000"
	}

	// Start the server with CORS middleware wrapping the router
	fmt.Printf("server starting on port %s\n", port)
	if err := http.ListenAndServe(":"+port, middleware.CORS(allowedOrigin)(router)); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
