package webhooks

import (
	"foundersignal/internal/service"
)

type Webhooks struct {
	Clerk ClerkHandler
}

type Secrets struct {
	ClerkWebhookSecret string
}

func NewWebhooks(services *service.Services, secrets Secrets) *Webhooks {
	return &Webhooks{
		Clerk: NewClerkHandler(services.User, secrets.ClerkWebhookSecret),
	}
}
