package main

import (
	"encoding/json"
	"net/http"
	"time"
)

// Handlers holds HTTP handlers
type Handlers struct {
	resolver *IntentResolver
}

// NewHandlers creates handlers
func NewHandlers(resolver *IntentResolver) *Handlers {
	return &Handlers{resolver: resolver}
}

// ChartHandler handles POST /api/chart
func (h *Handlers) ChartHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ChartRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Invalid JSON", Code: "INVALID_REQUEST"})
		return
	}

	if req.Prompt == "" {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{Error: "Missing or invalid prompt", Code: "INVALID_REQUEST"})
		return
	}

	result, err := h.resolver.Resolve(r.Context(), req.Prompt)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, ErrorResponse{Error: err.Error(), Code: "INTERNAL_ERROR"})
		return
	}

	writeJSON(w, http.StatusOK, result)
}

// HealthHandler handles GET /health
func (h *Handlers) HealthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":    "ok",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

func writeJSON(w http.ResponseWriter, status int, data any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
