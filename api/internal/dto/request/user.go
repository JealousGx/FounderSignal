package request

type ClerkUserCreateRequest struct {
	ID             string         `json:"id"`
	EmailAddresses []EmailAddress `json:"email_addresses"` // example: [{"email_address": "example@example.org", "id": "idn_29w83yL7CwVlJXylYLxcslromF1", "linked_to": [], "object": "email_address", "verification": {"status": "verified", "strategy": "ticket"}}]
	CreatedAt      int64          `json:"created_at"`
	UpdatedAt      int64          `json:"updated_at"`
	Deleted        bool           `json:"deleted"`
}

type ClerkEvent struct {
	Data ClerkUserCreateRequest `json:"data"`
	Type string                 `json:"type"`
}

type EmailAddress struct {
	EmailAddress string            `json:"email_address"`
	ID           string            `json:"id"`
	LinkedTo     []any             `json:"linked_to"`
	Object       string            `json:"object"`
	Verification ClerkVerification `json:"verification"`
}

type ClerkVerification struct {
	Status   string `json:"status"`
	Strategy string `json:"strategy"`
	ExpireAt *int64 `json:"expire_at,omitempty"`
	Attempts *int   `json:"attempts,omitempty"`
}
