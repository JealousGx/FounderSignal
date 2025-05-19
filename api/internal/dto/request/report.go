package request

import (
	"foundersignal/internal/domain"

	"github.com/google/uuid"
)

type GenerateReportRequest struct {
	IdeaID     uuid.UUID         `json:"ideaId" validate:"required"`
	IdeaStatus domain.IdeaStatus `json:"ideaStatus" validate:"required,oneof=draft active paused completed archived"`
	Type       domain.ReportType `json:"type" validate:"required,oneof=weekly monthly milestone final"`
}
