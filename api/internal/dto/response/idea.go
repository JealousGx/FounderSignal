package response

import (
	"github.com/google/uuid"
)

type IdeaListResponse struct {
	Ideas []IdeaList         `json:"ideas"`
	Total int64              `json:"total"`
	Stats UserDashboardStats `json:"stats,omitempty"`
}

type PublicIdeaResponse struct {
	Idea         PublicIdea    `json:"idea"`
	RelatedIdeas []RelatedIdea `json:"relatedIdeas"`
}

type IdeaList struct {
	ID             uuid.UUID `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	TargetAudience string    `json:"targetAudience"`
	CreatedAt      string    `json:"createdAt"`
	UpdatedAt      string    `json:"updatedAt"`
	Views          int       `json:"views"`
	Signups        int       `json:"signups"`
	EngagementRate float64   `json:"engagementRate"`
	Status         string    `json:"status"`
	Stage          string    `json:"stage"`
	TargetSignups  int       `json:"targetSignups"`
	ImageURL       string    `json:"imageUrl"`
}

type PublicIdea struct {
	ID                 uuid.UUID       `json:"id"`
	UserID             string          `json:"userId"`
	Title              string          `json:"title"`
	Description        string          `json:"description"`
	TargetAudience     string          `json:"targetAudience"`
	CreatedAt          string          `json:"createdAt"`
	Stage              string          `json:"stage"`
	Status             string          `json:"status"`
	EngagementRate     float64         `json:"engagementRate"`
	Views              int             `json:"views"`
	Likes              int             `json:"likes"`
	Dislikes           int             `json:"dislikes"`
	LikedByUser        bool            `json:"likedByUser"`
	DislikedByUser     bool            `json:"dislikedByUser"`
	Stats              PublicIdeaStats `json:"stats"`
	FeedbackHighlights []string        `json:"feedbackHighlights"`
}

type IdeaCommentResponse struct {
	Comments []IdeaComment `json:"comments"`
	Total    int64         `json:"total"`
}

type IdeaComment struct {
	ID             uuid.UUID     `json:"id"`
	UserID         string        `json:"userId"`
	Comment        string        `json:"comment"`
	Likes          int           `json:"likes"`
	Dislikes       int           `json:"dislikes"`
	LikedByUser    bool          `json:"likedByUser"`
	DislikedByUser bool          `json:"dislikedByUser"`
	CreatedAt      string        `json:"createdAt"`
	Replies        []IdeaComment `json:"replies,omitempty"`
}

type IdeaActivity struct {
	Views   int    `json:"views"`
	Signups int    `json:"signups"`
	Date    string `json:"date"`
}

type PublicIdeaStats struct {
	Signups        int     `json:"signups"`
	ConversionRate float64 `json:"conversionRate"`
	AvgTimeOnPage  string  `json:"avgTimeOnPage"`
	BounceRate     float64 `json:"bounceRate"`
}

type RelatedIdea struct {
	ID             uuid.UUID `json:"id"`
	Title          string    `json:"title"`
	Description    string    `json:"description"`
	EngagementRate float64   `json:"engagementRate"`
	ImageUrl       string    `json:"imageUrl"`
}

type UserDashboardStats struct {
	ActiveIdeas  int64 `json:"activeIdeas"`
	TotalSignups int64 `json:"totalSignups"` // total signups across all ideas for this month
	TotalViews   int64 `json:"totalViews"`   // total views across all ideas for this month

	// Trends (percentage change from last month)
	ActiveIdeasChange float64 `json:"activeIdeasChange,omitempty"`
	TotalIdeasChange  float64 `json:"totalIdeasChange,omitempty"`
	SignupsChange     float64 `json:"signupsChange,omitempty"`
	ViewsChange       float64 `json:"viewsChange,omitempty"`
}
