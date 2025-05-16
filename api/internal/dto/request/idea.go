package request

type CreateIdea struct {
	Title          string `json:"title" binding:"required,min=6"`
	Description    string `json:"description" binding:"required,min=30"`
	TargetAudience string `json:"targetAudience" binding:"required,min=8"`
	CTAButton      string `json:"ctaButtonText"`
}

type UpdateIdea struct {
	Title          string `json:"title" binding:"required,min=6"`
	Description    string `json:"description" binding:"required,min=30"`
	Status         string `json:"status" binding:"required,oneof=draft active paused completed archived"`
	Stage          string `json:"stage" binding:"required,oneof=validation mvp ideation"`
	TargetAudience string `json:"targetAudience" binding:"required,min=8"`
	TargetSignups  int    `json:"targetSignups" binding:"required,min=1"`
	ImageURL       string `json:"imageUrl"`
}

type UpdateMVP struct {
	Headline    string `json:"headline"`
	Subheadline string `json:"subheadline"`
	CTAButton   string `json:"ctaButtonText"`
	CTAText     string `json:"ctaText"`
}
