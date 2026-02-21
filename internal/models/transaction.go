package models

import "time"

type TransactionStatus string

const (
	StatusCaptured TransactionStatus = "Captured"
	StatusRefunded TransactionStatus = "Refunded"
	StatusPending  TransactionStatus = "Pending"
	StatusFailed   TransactionStatus = "Failed"
)

type Transaction struct {
	ID        string            `json:"id"`
	Amount    float64           `json:"amount"`
	Currency  string            `json:"currency"`
	Status    TransactionStatus `json:"status"`
	Merchant  string            `json:"merchant"`
	CreatedAt time.Time         `json:"created_at"`
}

type IntegrityHealth struct {
	Uptime       float64 `json:"uptime"`
	FraudRate    float64 `json:"fraud_rate"`
	ResponseTime int     `json:"response_time"`
}
