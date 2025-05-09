package request

type CreateIdea struct {
	UserID         string `json:"userId" binding:"required"`
	Title          string `json:"title" binding:"required,min=10"`
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
