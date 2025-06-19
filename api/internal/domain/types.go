package domain

import (
	"time"

	"github.com/google/uuid"
)

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
	Limit    int
	Offset   int
	Order    string
	SortBy   string
	FilterBy string
	Search   string

	LastCreatedAt time.Time
	LastId        uuid.UUID
}

type EventType string

// Event type constants for tracking user interactions
const (
	EventTypePageView   EventType = "pageview"
	EventTypeClick      EventType = "cta_click"
	EventTypeScroll     EventType = "scroll_depth"
	EventTypeTimeOnPage EventType = "time_on_page"
)

type IdeaStatus string

const (
	IdeaStatusDraft     IdeaStatus = "draft"
	IdeaStatusActive    IdeaStatus = "active"
	IdeaStatusPaused    IdeaStatus = "paused"
	IdeaStatusCompleted IdeaStatus = "completed"
	IdeaStatusArchived  IdeaStatus = "archived"
)
