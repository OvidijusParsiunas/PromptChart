package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
)

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func main() {
	// Load config from environment
	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		log.Println("Warning: OPENAI_API_KEY not set. LLM features will not work.")
	}

	model := getEnv("OPENAI_MODEL", "gpt-4o-mini")
	port := getEnv("PORT", "3000")

	// Initialize components
	llmProvider := NewOpenAIProvider(LLMConfig{
		APIKey: apiKey,
		Model:  model,
	})
	dataAdapter := &MockDataAdapter{}
	resolver := NewIntentResolver(llmProvider, dataAdapter)
	handlers := NewHandlers(resolver)

	// Setup routes
	mux := http.NewServeMux()
	mux.HandleFunc("/api/chart", handlers.ChartHandler)
	mux.HandleFunc("/health", handlers.HealthHandler)

	// Start server
	fmt.Printf("PromptChart backend running at http://localhost:%s\n", port)
	fmt.Printf("API endpoint: POST http://localhost:%s/api/chart\n", port)

	if err := http.ListenAndServe(":"+port, corsMiddleware(mux)); err != nil {
		log.Fatal(err)
	}
}
