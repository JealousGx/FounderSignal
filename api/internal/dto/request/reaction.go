package request

type ReactionType string

const (
	LikeReaction    ReactionType = "like"
	DislikeReaction ReactionType = "dislike"
	RemoveReaction  ReactionType = "remove"
)

type Reaction struct {
	Type ReactionType `json:"type" binding:"required,oneof=like dislike remove"`
}
