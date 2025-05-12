package domain

type DBConfig struct {
	User string
	Pass string
	SSL  string
	Name string
	Host string
	Port string
}

type Server struct {
	Host string
	Port string
}

type QueryParams struct {
	Limit  int
	Offset int
	Order  string
}

type EventType string

// Event type constants for tracking user interactions
const (
	EventTypePageView EventType = "pageview"
	EventTypeSignup   EventType = "signup"
	EventTypeClick    EventType = "click"
)

type IdeaStatus string

const (
	IdeaStatusDraft     IdeaStatus = "draft"
	IdeaStatusActive    IdeaStatus = "active"
	IdeaStatusPaused    IdeaStatus = "paused"
	IdeaStatusCompleted IdeaStatus = "completed"
	IdeaStatusArchived  IdeaStatus = "archived"
)
