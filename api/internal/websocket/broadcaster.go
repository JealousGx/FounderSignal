package websocket

import (
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/request"
	"foundersignal/internal/dto/response"
	"foundersignal/internal/pkg"
	"log"
	"time"
)

type ActivityBroadcaster interface {
	BroadcastActivity(userID string, activityItem *response.ActivityItem)
	FormatAndBroadcastSignal(userID string, signal domain.Signal, ideaTitle string)
	FormatAndBroadcastSignup(userID string, signup domain.AudienceMember, ideaTitle string)
	FormatAndBroadcastComment(userID string, comment domain.Feedback, ideaTitle string)
	FormatAndBroadcastReaction(userID string, reaction domain.IdeaReaction, ideaTitle string)
	FormatAndBroadcastContentReport(userID string, activity domain.Activity, ideaTitle string)
}

type hubBroadcaster struct {
	hub *Hub
}

func NewHubBroadcaster(hub *Hub) ActivityBroadcaster {
	return &hubBroadcaster{hub: hub}
}

func (b *hubBroadcaster) BroadcastActivity(userID string, activityItem *response.ActivityItem) {
	if userID == "" {
		log.Println("WARN: Attempted to broadcast activity with empty userID")
		return
	}
	if activityItem == nil {
		log.Println("WARN: Attempted to broadcast nil activityItem")
		return
	}
	// Ensure timestamp is set if not already
	if activityItem.Timestamp.IsZero() {
		activityItem.Timestamp = time.Now()
	}
	b.hub.BroadcastToUser(userID, activityItem)
}

func (b *hubBroadcaster) FormatAndBroadcastSignal(userID string, signal domain.Signal, ideaTitle string) {
	var message string
	switch signal.EventType {
	case string(domain.EventTypePageView):
		message = "Someone viewed your landing page"
	case string(domain.EventTypeClick):
		message = "Someone clicked your CTA button"
	case string(domain.EventTypeScroll):
		message = "Someone scrolled through your landing page"
	default:
		message = "Someone interacted with your landing page"
	}

	activityItem := &response.ActivityItem{
		ID:        signal.ID.String(),
		Type:      string(signal.EventType),
		IdeaID:    signal.IdeaID.String(),
		IdeaTitle: ideaTitle,
		Message:   message,
		Timestamp: signal.CreatedAt,
	}
	b.BroadcastActivity(userID, activityItem)
}

func (b *hubBroadcaster) FormatAndBroadcastSignup(userID string, signup domain.AudienceMember, ideaTitle string) {
	activityItem := &response.ActivityItem{
		ID:        signup.UserID,
		Type:      "cta_click",
		IdeaID:    signup.IdeaID.String(),
		IdeaTitle: ideaTitle,
		Message:   "Someone signed up for your idea",
		Timestamp: signup.SignupTime,
	}
	b.BroadcastActivity(userID, activityItem)
}

func (b *hubBroadcaster) FormatAndBroadcastComment(userID string, comment domain.Feedback, ideaTitle string) {
	activityItem := &response.ActivityItem{
		ID:        comment.ID.String(),
		Type:      "comment",
		IdeaID:    comment.IdeaID.String(),
		IdeaTitle: ideaTitle,
		Message:   fmt.Sprintf("Someone commented: \"%s\"", pkg.TruncateComment(comment.Comment, 30)),
		Timestamp: comment.CreatedAt,
	}
	b.BroadcastActivity(userID, activityItem)
}

func (b *hubBroadcaster) FormatAndBroadcastReaction(userID string, reaction domain.IdeaReaction, ideaTitle string) {
	var message string
	activityType := string(reaction.ReactionType)

	switch activityType {
	case string(request.LikeReaction):
		message = "Someone liked your idea"
	case string(request.DislikeReaction):
		message = "Someone disliked your idea"
	default:
		message = "Someone reacted to your idea"
		activityType = "reaction" // Fallback type
	}

	activityItem := &response.ActivityItem{
		ID:        reaction.ID.String(),
		Type:      activityType,
		IdeaID:    reaction.IdeaID.String(),
		IdeaTitle: ideaTitle,
		Message:   message,
		Timestamp: reaction.CreatedAt,
	}
	b.BroadcastActivity(userID, activityItem)
}

func (b *hubBroadcaster) FormatAndBroadcastContentReport(userID string, activity domain.Activity, ideaTitle string) {

	activityItem := &response.ActivityItem{
		ID:           activity.ID.String(),
		Type:         string(activity.Type),
		IdeaID:       activity.IdeaID.String(),
		IdeaTitle:    ideaTitle,
		Message:      activity.Message,
		Timestamp:    activity.CreatedAt,
		ReferenceURL: activity.ReferenceURL,
	}
	b.BroadcastActivity(userID, activityItem)
}
