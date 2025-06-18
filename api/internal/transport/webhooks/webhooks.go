package webhooks

import (
	"foundersignal/internal/service"
)

type Webhooks struct {
	Clerk  ClerkHandler
	Paddle PaddleHandler
}

type Secrets struct {
	ClerkWebhookSecret  string
	PaddleWebhookSecret string
}

func NewWebhooks(services *service.Services, secrets Secrets) *Webhooks {
	return &Webhooks{
		Clerk:  NewClerkHandler(services.User, secrets.ClerkWebhookSecret),
		Paddle: NewPaddleHandler(services.Paddle, secrets.PaddleWebhookSecret),
	}
}
