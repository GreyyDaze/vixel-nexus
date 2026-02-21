package handlers

import (
	"fmt"
	"math/rand"
	"net/http"
	"time"
	"vixel-nexus/internal/components"
	"vixel-nexus/internal/models"

	"github.com/a-h/templ"
)

func NewTransaction() models.Transaction {
	merchants := []string{"Global Shop", "Tech Flow", "Aether Corp", "Nebula Systems", "Vertex Pay"}
	statuses := []models.TransactionStatus{models.StatusCaptured, models.StatusRefunded, models.StatusPending, models.StatusFailed}
	
	return models.Transaction{
		ID:        fmt.Sprintf("%X", rand.Int63n(1e12)),
		Amount:    rand.Float64() * 1000,
		Currency:  "USD",
		Status:    statuses[rand.Intn(len(statuses))],
		Merchant:  merchants[rand.Intn(len(merchants))],
		CreatedAt: time.Now(),
	}
}

func HandleDashboard(w http.ResponseWriter, r *http.Request) {
	health := models.IntegrityHealth{
		Uptime:       99.98,
		FraudRate:    0.04,
		ResponseTime: 124,
	}

	// Initial set of transactions
	initialData := []models.Transaction{
		NewTransaction(),
		NewTransaction(),
		NewTransaction(),
	}

	templ.Handler(components.Dashboard(health, initialData)).ServeHTTP(w, r)
}

func HandleTransactions(w http.ResponseWriter, r *http.Request) {
	// Simulate a random "Integrity Failure" occasionally (for resilience demo)
	if rand.Intn(20) == 0 {
		http.Error(w, "Integrity Sync Failed", http.StatusInternalServerError)
		return
	}

	// Just return a newly captured transaction as a row fragment
	t := NewTransaction()
	templ.Handler(components.TransactionRow(t)).ServeHTTP(w, r)
}

func HandleHealth(w http.ResponseWriter, r *http.Request) {
	// Small health indicator fragment logic could go here
	w.WriteHeader(http.StatusOK)
}
