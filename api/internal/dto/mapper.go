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

func ToIdeasListResponse(ideas []*domain.Idea, count int64, stats *response.UserDashboardStats) *response.IdeaListResponse {
	res := &response.IdeaListResponse{
		Total: count,
		Ideas: []response.IdeaList{},
	}

	for _, idea := range ideas {
		engagementRate := calculateEngagementRate(idea.Views, idea.Signups)

		res.Ideas = append(res.Ideas, response.IdeaList{
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

	if stats != nil {
		res.Stats = *stats
	}

	return res
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

func FeedbackToIdeaComments(feedbacks []domain.Feedback, requestingUserID *string, totalComments int64) *response.IdeaCommentResponse {
	if len(feedbacks) == 0 {
		return nil
	}

	return &response.IdeaCommentResponse{
		Total:    totalComments,
		Comments: mapFeedbackToIdeaComments(feedbacks, requestingUserID),
	}
}

func mapFeedbackToIdeaComments(feedbacks []domain.Feedback, requestingUserID *string) []response.IdeaComment {
	flatFeedbacks := flattenFeedbacks(feedbacks)
	allCommentsMap := make(map[uuid.UUID]*response.IdeaComment)
	rootComments := make([]response.IdeaComment, 0)

	// Pass 1: Create all comment response objects and store pointers in a map.
	// Initialize Replies as empty; they will be populated in Pass 2.
	for _, fb := range flatFeedbacks {
		var likedByUser, dislikedByUser bool
		if requestingUserID != nil && fb.Reactions != nil {
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

		commentNode := &response.IdeaComment{
			ID:             fb.ID,
			UserID:         fb.UserID,
			Comment:        fb.Comment,
			Likes:          fb.Likes,
			Dislikes:       fb.Dislikes,
			LikedByUser:    likedByUser,
			DislikedByUser: dislikedByUser,
			CreatedAt:      fb.CreatedAt.Format(time.RFC3339),
			Replies:        make([]response.IdeaComment, 0),
		}
		allCommentsMap[fb.ID] = commentNode
	}

	// Pass 2: Link replies to their parents.
	// This pass populates the .Replies field of the commentNode structs *in the allCommentsMap*.
	for _, fb := range flatFeedbacks {
		// We are interested in comments that are replies (have a ParentID)
		if fb.ParentID != nil && *fb.ParentID != uuid.Nil {
			if parentNode, parentExists := allCommentsMap[*fb.ParentID]; parentExists {
				// childNode is the current feedback item's representation from the map
				if childNode, childExists := allCommentsMap[fb.ID]; childExists {
					parentNode.Replies = append(parentNode.Replies, *childNode)
				}
			}
			// If parentNode doesn't exist, this childNode is an orphan.
			// It won't be added to any parent's Replies list.
			// It will be picked up as a root comment in Pass 3 if its parent is missing.
		}
	}

	// Pass 3: Populate rootComments.
	// Iterate through the flat list again. A comment is a root if it has no parent
	// or if its designated parent was not found in the current batch (making it an orphan root).
	for _, fb := range flatFeedbacks {
		isRoot := false
		if fb.ParentID == nil || *fb.ParentID == uuid.Nil {
			isRoot = true
		} else {
			// It has a ParentID, but check if the parent actually exists in our map.
			// If the parent isn't in allCommentsMap (e.g., not part of this fetched batch),
			// then this comment, despite having a ParentID, effectively becomes a root for this dataset.
			if _, parentExistsInMap := allCommentsMap[*fb.ParentID]; !parentExistsInMap {
				isRoot = true
			}
		}

		if isRoot {
			if commentNode, exists := allCommentsMap[fb.ID]; exists {
				rootComments = append(rootComments, *commentNode)
			}
		}
	}

	return rootComments
}

func flattenFeedbacks(nestedFeedbacks []domain.Feedback) []domain.Feedback {
	var flatList []domain.Feedback
	queue := make([]domain.Feedback, 0, len(nestedFeedbacks))
	queue = append(queue, nestedFeedbacks...)

	// Keep track of processed IDs to avoid duplicates if the input structure is complex
	// or if items could appear in multiple places (though unlikely for comments).
	processedIDs := make(map[uuid.UUID]struct{})

	for len(queue) > 0 {
		fb := queue[0]
		queue = queue[1:]

		if _, exists := processedIDs[fb.ID]; exists {
			continue
		}
		processedIDs[fb.ID] = struct{}{}

		// Add a copy of the current feedback item to the flat list.
		// Its own 'Replies' field is set to nil because the hierarchy
		// will be reconstructed based on 'ParentID' in the main mapping function.
		flatItem := fb
		flatItem.Replies = nil
		flatList = append(flatList, flatItem)

		// Enqueue its nested replies for processing.
		if fb.Replies != nil {
			queue = append(queue, fb.Replies...)
		}
	}

	return flatList
}
