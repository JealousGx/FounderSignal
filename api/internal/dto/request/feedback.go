package request

type CreateFeedback struct {
	Comment string `json:"comment" binding:"required"`
}
