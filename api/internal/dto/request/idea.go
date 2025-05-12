package request

type CreateIdea struct {
	Title          string `json:"title" binding:"required,min=6"`
	Description    string `json:"description" binding:"required,min=30"`
	TargetAudience string `json:"targetAudience" binding:"required,min=8"`
	CTAButton      string `json:"ctaButtonText"`
}

type UpdateMVP struct {
	Headline    string `json:"headline"`
	Subheadline string `json:"subheadline"`
	CTAButton   string `json:"ctaButtonText"`
	CTAText     string `json:"ctaText"`
}
