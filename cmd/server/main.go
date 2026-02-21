package main

import (
	"fmt"
	"log"
	"net/http"
	"vixel-nexus/internal/handlers"
)

func main() {
	mux := http.NewServeMux()

	// Dashboard Routes
	mux.HandleFunc("/", handlers.HandleDashboard)
	
	// HTMX Fragment Routes
	mux.HandleFunc("/transactions", handlers.HandleTransactions)
	mux.HandleFunc("/health", handlers.HandleHealth)

	// Static File Server (Serving nexus.js and test-merchant.html)
	fileServer := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fileServer))

	port := ":8080"
	fmt.Printf("Nexus Orchestrator active at http://localhost%s\n", port)
	fmt.Printf("--- Dashboard: http://localhost%s\n", port)
	fmt.Printf("--- Test Merchant: http://localhost%s/static/test-merchant.html\n", port)
	
	if err := http.ListenAndServe(port, mux); err != nil {
		log.Fatal(err)
	}
}
