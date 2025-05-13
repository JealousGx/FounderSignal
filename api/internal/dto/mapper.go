package dto

import (
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"sort"
	"time"

	"github.com/google/uuid"
)

func ToCreateIdeaRequest(idea *domain.Idea) *request.CreateIdea {
	return &request.CreateIdea{
		Title:          idea.Title,
		Description:    idea.Description,
		TargetAudience: idea.TargetAudience,
		CTAButton:      idea.MVPSimulator.CTAButton,
	}
}

func ToIdeasListResponse(ideas []*domain.Idea, count int64) *response.IdeaListResponse {
	publicIdeas := &response.IdeaListResponse{
		Total: count,
		Ideas: []response.IdeaList{},
	}

	for _, idea := range ideas {
		engagementRate := calculateEngagementRate(idea.Views, idea.Signups)

		publicIdeas.Ideas = append(publicIdeas.Ideas, response.IdeaList{
			ID:             idea.ID,
			Title:          idea.Title,
			Description:    idea.Description,
			TargetAudience: idea.TargetAudience,
			Status:         idea.Status,
			Stage:          idea.Stage,
			TargetSignups:  idea.TargetSignups,
			ImageURL:       idea.ImageURL,
			Views:          idea.Views,
			Signups:        idea.Signups,
			EngagementRate: engagementRate,
			CreatedAt:      idea.CreatedAt.Format("2006-01-02"),
			UpdatedAt:      idea.UpdatedAt.Format("2006-01-02"),
		})
	}
	return publicIdeas
}

func ToPublicIdea(idea *domain.Idea, relatedIdeas []*domain.Idea, requestingUserID string) *response.PublicIdeaResponse {
	if idea == nil {
		return nil
	}

	engagementRate := calculateEngagementRate(idea.Views, idea.Signups)

	// Determine LikedByUser / DislikedByUser for the idea
	var likedByUser, dislikedByUser bool
	for _, reaction := range idea.Reactions {
		if reaction.UserID == requestingUserID {
			if reaction.ReactionType == string(request.LikeReaction) {
				likedByUser = true
			} else if reaction.ReactionType == string(request.DislikeReaction) {
				dislikedByUser = true
			}
			break // Assuming a user can only have one reaction type
		}
	}

	var feedbackHighlights []string
	// Create a temporary slice to sort comments by likes without modifying the original
	tempComments := make([]domain.Feedback, len(idea.Feedback))
	copy(tempComments, idea.Feedback)
	sort.SliceStable(tempComments, func(i, j int) bool {
		return tempComments[i].Likes > tempComments[j].Likes // Sort descending by likes
	})
	for i := 0; i < len(tempComments) && i < 3; i++ { // Limit to top 3 comments
		if tempComments[i].Comment != "" {
			feedbackHighlights = append(feedbackHighlights, tempComments[i].Comment)
		}
	}

	resIdea := &response.PublicIdea{
		ID:                 idea.ID,
		UserID:             idea.UserID,
		Title:              idea.Title,
		Description:        idea.Description,
		TargetAudience:     idea.TargetAudience,
		CreatedAt:          idea.CreatedAt.Format(time.RFC3339),
		Stage:              idea.Stage,
		Status:             idea.Status,
		EngagementRate:     engagementRate,
		Views:              idea.Views,
		Likes:              idea.Likes,
		Dislikes:           idea.Dislikes,
		LikedByUser:        likedByUser,
		DislikedByUser:     dislikedByUser,
		Stats:              calculateIdeaStats(idea.Signals, idea.Signups),
		FeedbackHighlights: feedbackHighlights,
	}

	// Map related ideas
	relatedIdeasResponse := []response.RelatedIdea{}
	for _, relatedIdea := range relatedIdeas {
		relatedIdeasResponse = append(relatedIdeasResponse, response.RelatedIdea{
			ID:             relatedIdea.ID,
			Title:          relatedIdea.Title,
			Description:    relatedIdea.Description,
			EngagementRate: calculateEngagementRate(relatedIdea.Views, relatedIdea.Signups),
			ImageUrl:       relatedIdea.ImageURL,
		})
	}

	return &response.PublicIdeaResponse{
		Idea:         *resIdea,
		RelatedIdeas: relatedIdeasResponse,
	}
}

func FeedbackToIdeaComments(feedbacks []domain.Feedback, requestingUserID *string) []response.IdeaComment {
	if len(feedbacks) == 0 {
		return nil
	}

	ideaComments := make([]response.IdeaComment, 0, len(feedbacks))
	commentMap := make(map[uuid.UUID]*response.IdeaComment)

	for _, fb := range feedbacks {
		var likedByUser, dislikedByUser bool

		if requestingUserID != nil {
			for _, reaction := range fb.Reactions {
				if reaction.UserID == *requestingUserID {
					if reaction.ReactionType == string(request.LikeReaction) {
						likedByUser = true
					} else if reaction.ReactionType == string(request.DislikeReaction) {
						dislikedByUser = true
					}
					break
				}
			}
		}

		comment := response.IdeaComment{
			ID:             fb.ID,
			UserID:         fb.UserID,
			Comment:        fb.Comment,
			Likes:          fb.Likes,
			Dislikes:       fb.Dislikes,
			LikedByUser:    likedByUser,
			DislikedByUser: dislikedByUser,
			CreatedAt:      fb.CreatedAt.Format(time.RFC3339),
			Replies:        FeedbackToIdeaComments(fb.Replies, requestingUserID),
		}

		if fb.ParentID != nil {
			// If the feedback has a parent, find it in our map and add this as a reply
			if parent, exists := commentMap[*fb.ParentID]; exists {
				parent.Replies = append(parent.Replies, comment)
			}
			continue
		}

		ideaComments = append(ideaComments, comment)

		commentMap[fb.ID] = &ideaComments[len(ideaComments)-1]
	}
	return ideaComments
}
