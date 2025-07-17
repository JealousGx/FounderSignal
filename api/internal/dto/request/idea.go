package request

type CreateIdea struct {
	Title          string `json:"title" binding:"required,min=6"`
	Description    string `json:"description" binding:"required,min=30"`
	TargetAudience string `json:"targetAudience" binding:"required,min=8"`
	CTAButton      string `json:"ctaButtonText"`
	ForceNew       bool   `json:"forceNew"`
	HTMLURL        string `json:"htmlUrl"` // URL to the r2 hosted HTML content
}

type UpdateIdea struct {
	Title          *string `json:"title" binding:"omitempty,min=6"`
	Description    *string `json:"description" binding:"omitempty,min=30"`
	IsPrivate      *bool   `json:"isPrivate"`
	Status         *string `json:"status" binding:"omitempty,oneof=draft active paused completed archived"`
	Stage          *string `json:"stage" binding:"omitempty,oneof=validation mvp ideation"`
	TargetAudience *string `json:"targetAudience" binding:"omitempty,min=8"`
	TargetSignups  *int    `json:"targetSignups" binding:"omitempty,min=1"`
	ImageURL       *string `json:"imageUrl"`
}

type CreateMVP struct {
	Name     string `json:"name"`
	HTMLURL  string `json:"htmlUrl"` // URL to the r2 hosted HTML content
	IsActive bool   `json:"isActive"`
}

type UpdateMVP struct {
	Name     *string `json:"name"`
	IsActive *bool   `json:"isActive"`
	HTMLURL  *string `json:"htmlUrl"` // URL to the r2 hosted HTML content
}
