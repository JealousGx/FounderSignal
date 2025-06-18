package dto

import (
	"fmt"
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
		var isPrivate bool
		if idea.IsPrivate != nil {
			isPrivate = *idea.IsPrivate
		} else {
			isPrivate = false
		}

		res.Ideas = append(res.Ideas, response.IdeaList{
			ID:             idea.ID,
			Title:          idea.Title,
			Description:    idea.Description,
			TargetAudience: idea.TargetAudience,
			IsPrivate:      isPrivate,
			Status:         idea.Status,
			Stage:          idea.Stage,
			TargetSignups:  idea.TargetSignups,
			ImageURL:       idea.ImageURL,
			Views:          idea.Views,
			Signups:        idea.Signups,
			EngagementRate: CalculateConversionRate(int(idea.Views), int(idea.Signups)),
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
		EngagementRate:     CalculateConversionRate(int(idea.Views), int(idea.Signups)),
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
			EngagementRate: CalculateConversionRate(int(relatedIdea.Views), int(relatedIdea.Signups)),
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

func ToReportListResponse(reports []domain.Report) response.ReportListResponse {
	return response.ReportListResponse{
		Reports: ToReportsResponse(reports),
	}
}

func ToReportPageResponse(report *domain.Report, thresholds response.ReportValidationThreshold) response.ReportPageResponse {
	convertedReport := toReportResponse(*report)

	return response.ReportPageResponse{
		Report:              convertedReport,
		ValidationThreshold: thresholds,
		Insights:            getReportInsights(report, convertedReport.ConversionRate, thresholds),
	}
}

func ToReportsResponse(reports []domain.Report) []response.ReportResponse {
	var reportsResponse []response.ReportResponse
	for _, report := range reports {
		reportsResponse = append(reportsResponse, toReportResponse(report))
	}

	return reportsResponse
}

func toReportResponse(report domain.Report) response.ReportResponse {
	return response.ReportResponse{
		ID:              report.ID,
		Date:            report.Date,
		Type:            report.Type,
		Views:           report.Views,
		Signups:         report.Signups,
		ConversionRate:  CalculateConversionRate(int(report.Views), int(report.Signups)),
		EngagementRate:  report.EngagementRate,
		Validated:       report.Validated,
		Sentiment:       report.Sentiment,
		CreatedAt:       report.CreatedAt.Format(time.RFC3339),
		UpdatedAt:       report.UpdatedAt.Format(time.RFC3339),
		Recommendations: generateReportRecommendations(report),
		Idea: response.ReportIdea{
			ID:    report.Idea.ID,
			Title: report.Idea.Title,
		},
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

func generateReportRecommendations(report domain.Report) []string {
	recommendations := []string{}

	lowConversionThreshold := 10.0
	criticalConversionThreshold := 5.0
	decentViewsThreshold := int64(50)
	lowSignupsThreshold := int64(20)

	goodConversionThreshold := 15.0
	lowViewsForGoodConversion := int64(100)
	lowSentimentThreshold := 0.6
	criticalSentimentThreshold := 0.4

	sufficientSignupsForSentiment := int64(10)
	minimalSignupsForCriticalSentiment := int64(5)

	targetSignupsForValidation := int64(report.Idea.TargetSignups)

	conversionRate := CalculateConversionRate(int(report.Views), int(report.Signups))

	// rule: low conversion rate
	if conversionRate < criticalConversionThreshold && report.Views > decentViewsThreshold {
		recommendations = append(recommendations, fmt.Sprintf(
			"Critically low conversion rate (%.1f%%) despite good views. Urgently A/B test your landing page headline, call-to-action, or value proposition.",
			conversionRate,
		))
	} else if conversionRate < lowConversionThreshold && report.Views > decentViewsThreshold {
		recommendations = append(recommendations, fmt.Sprintf(
			"Conversion rate (%.1f%%) is low. Consider simplifying the signup form or clarifying your offer.",
			conversionRate,
		))
	} else if conversionRate < lowConversionThreshold && report.Views <= decentViewsThreshold && report.Views > 0 {
		recommendations = append(recommendations, fmt.Sprintf(
			"Both views and conversion rate (%.1f%%) are low. Focus on increasing targeted traffic first, then optimize for conversions.",
			conversionRate,
		))
	}

	// rule: low signups despite good views (implies low views)
	if report.Signups < lowSignupsThreshold && conversionRate > goodConversionThreshold && report.Views < lowViewsForGoodConversion {
		recommendations = append(recommendations, fmt.Sprintf(
			"Good conversion rate (%.1f%%), but low total signups. Aim to increase visitor traffic to your page.",
			conversionRate,
		))
	}

	// rule: low sentiment
	if report.Sentiment < criticalSentimentThreshold && report.Signups >= minimalSignupsForCriticalSentiment {
		recommendations = append(recommendations, fmt.Sprintf(
			"User sentiment (%.1f%%) is critically low. Prioritize reviewing and addressing user feedback immediately.",
			report.Sentiment*100,
		))
	} else if report.Sentiment < lowSentimentThreshold && report.Signups >= sufficientSignupsForSentiment {
		recommendations = append(recommendations, fmt.Sprintf(
			"User sentiment (%.1f%%) is low. Dig into feedback to understand concerns and improve user experience.",
			report.Sentiment*100,
		))
	}

	// rule: validated but sentiment could be improved
	if report.Validated && report.Sentiment >= lowSentimentThreshold && report.Sentiment < 0.75 {
		recommendations = append(recommendations, fmt.Sprintf(
			"Congrats on validation! To boost user satisfaction, consider addressing feedback to improve sentiment from its current level of %.1f%%.",
			report.Sentiment*100,
		))
	}

	// rule: not validated
	if !report.Validated {
		if conversionRate < lowConversionThreshold && report.Signups < targetSignupsForValidation {
			recommendations = append(recommendations, "Idea not yet validated. Focus on improving conversion and increasing signups. Experiment with messaging or target audiences.")
		} else if report.Signups < targetSignupsForValidation {
			recommendations = append(recommendations, "Validation is close but signups are below target. Explore new marketing channels or refine existing ones to get more users.")
		}
	}

	// rule: general advice based on report type
	switch report.Type {
	case domain.ReportTypeWeekly:
		if len(recommendations) < 2 {
			recommendations = append(recommendations, "For this weekly report, identify one key metric to improve for next week. Small, consistent improvements add up.")
		}
	case domain.ReportTypeMonthly:
		if len(recommendations) < 2 {
			recommendations = append(recommendations, "Review monthly trends. Are key metrics consistently improving? Plan your next month's focus based on these insights.")
		}
	}

	// fallback / generic recommendations if few or no specific rules met
	if len(recommendations) == 0 {
		recommendations = append(recommendations,
			"Deeply analyze your report data to uncover specific areas for improvement or opportunities.",
		)
		recommendations = append(recommendations,
			"Consider running a small survey with your existing signups to gather direct qualitative feedback.",
		)
	} else if len(recommendations) == 1 {
		recommendations = append(recommendations,
			"Continue monitoring user feedback for ongoing insights.",
		)
	}

	if len(recommendations) > 2 {
		return recommendations[:2]
	}

	return recommendations
}

func getReportInsights(report *domain.Report, conversionRate float64, thresholds response.ReportValidationThreshold) []string {
	minSignups := float64(thresholds.Signups)
	minConversionRate := thresholds.ConversionRate

	const HIGH_PERFORMANCE_FACTOR = 1.5 // 150% of min
	const LOW_PERFORMANCE_FACTOR = 0.5  // 50% of min
	const GOOD_PERFORMANCE_FACTOR = 1.0 // 100%

	insights := []string{}

	if minConversionRate > 0 {
		if conversionRate >= minConversionRate*HIGH_PERFORMANCE_FACTOR {
			insights = append(insights, fmt.Sprintf("Conversion rate (%.2f%%) is exceptionally high, exceeding %.2f%% of the target (%.2f%%).", conversionRate, HIGH_PERFORMANCE_FACTOR*100, minConversionRate))
		} else if conversionRate >= minConversionRate*GOOD_PERFORMANCE_FACTOR {
			insights = append(insights, fmt.Sprintf("Conversion rate (%.2f%%) has met or exceeded the target (%.2f%%).", conversionRate, minConversionRate))
		} else if conversionRate < minConversionRate*LOW_PERFORMANCE_FACTOR {
			insights = append(insights, fmt.Sprintf("Conversion rate (%.2f%%) is below %.2f%% of the target (%.2f%%) and may need improvement.", conversionRate, LOW_PERFORMANCE_FACTOR*100, minConversionRate))
		} else {
			insights = append(insights, fmt.Sprintf("Conversion rate (%.2f%%) is approaching the target of %.2f%%.", conversionRate, minConversionRate))
		}
	} else {
		insights = append(insights, fmt.Sprintf("Current conversion rate is %.2f%%. No specific target was set for this report type.", conversionRate))
	}

	// Signup insights
	if minSignups > 0 {
		if float64(report.Signups) >= minSignups*HIGH_PERFORMANCE_FACTOR {
			insights = append(insights, fmt.Sprintf("Signups (%d) are significantly high, exceeding %.2f%% of the target (%d). This suggests strong market interest.", report.Signups, HIGH_PERFORMANCE_FACTOR*100, int(minSignups)))
		} else if float64(report.Signups) >= minSignups*GOOD_PERFORMANCE_FACTOR {
			insights = append(insights, fmt.Sprintf("Signups (%d) have met or exceeded the target (%d).", report.Signups, int(minSignups)))
		} else if float64(report.Signups) < minSignups*LOW_PERFORMANCE_FACTOR {
			insights = append(insights, fmt.Sprintf("Signups (%d) are below %.2f%% of the target (%d) and are relatively low for this stage.", report.Signups, LOW_PERFORMANCE_FACTOR*100, int(minSignups)))
		} else {
			insights = append(insights, fmt.Sprintf("Signups (%d) are approaching the target of %d.", report.Signups, int(minSignups)))
		}
	} else {
		insights = append(insights, fmt.Sprintf("Current signups: %d. No specific target was set for this report type.", report.Signups))
	}

	if report.Validated {
		insights = append(insights, "This idea has met all validation criteria for this report and is on a good track.")
	} else {
		insights = append(insights, "Additional progress is needed to meet all validation criteria for this report.")
	}

	if report.EngagementRate > 0 {
		if report.EngagementRate > 50 {
			insights = append(insights, fmt.Sprintf("Engagement rate (%.2f%%) is strong, indicating good user interaction.", report.EngagementRate))
		} else if report.EngagementRate > 20 {
			insights = append(insights, fmt.Sprintf("Engagement rate (%.2f%%) is moderate. Consider strategies to boost user interaction.", report.EngagementRate))
		} else {
			insights = append(insights, fmt.Sprintf("Engagement rate (%.2f%%) is low. Focus on improving user experience and calls to action.", report.EngagementRate))
		}
	}

	if report.Sentiment != 0 {
		if report.Sentiment > 0.5 {
			insights = append(insights, fmt.Sprintf("Overall sentiment (%.2f) is positive, suggesting users are responding well.", report.Sentiment))
		} else if report.Sentiment < -0.2 {
			insights = append(insights, fmt.Sprintf("Overall sentiment (%.2f) is leaning negative. It might be worth investigating feedback.", report.Sentiment))
		} else {
			insights = append(insights, fmt.Sprintf("Overall sentiment (%.2f) is neutral to slightly positive.", report.Sentiment))
		}
	}

	return insights
}
