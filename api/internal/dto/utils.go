package dto

import (
	"encoding/json"
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/dto/response"
	"math"
)

type sessionActivity struct {
	hasPageview    bool
	hasInteraction bool
}

func CalculateConversionRate(views, signups int) float64 {
	if views == 0 {
		return 0
	}

	return math.Round((float64(signups) / float64(views)) * 100)
}

func calculateIdeaStats(signals []domain.Signal, signups int) response.PublicIdeaStats {
	var bounceRate float64 = 0.0 // Default to 0
	var totalDurationSeconds float64
	var timeOnPageEventsCount int
	var conversionRate float64 = 0.0 // Default to 0
	avgTimeOnPageStr := "N/A"

	// sessionKey -> activity
	sessions := make(map[string]*sessionActivity)

	for _, signal := range signals {
		var sessionKey string
		if signal.UserID != "" {
			sessionKey = "user_" + signal.UserID
		} else {
			// For anonymous users, combine IP and UserAgent.
			sessionKey = "anon_" + signal.IPAddress + "_" + signal.UserAgent
		}

		if _, ok := sessions[sessionKey]; !ok {
			sessions[sessionKey] = &sessionActivity{}
		}
		currentSessionActivity := sessions[sessionKey]

		isInteractionEvent := false
		switch signal.EventType {
		case string(domain.EventTypePageView):
			currentSessionActivity.hasPageview = true
		case string(domain.EventTypeClick):
			isInteractionEvent = true
		case string(domain.EventTypeScroll):
			var meta struct {
				Percentage int `json:"percentage"`
			}
			if signal.Metadata != nil {
				if err := json.Unmarshal(signal.Metadata, &meta); err == nil {
					if meta.Percentage > 10 {
						isInteractionEvent = true
					}
				}
			}
		case string(domain.EventTypeTimeOnPage):
			var meta struct {
				DurationSeconds int `json:"duration_seconds"`
			}
			if signal.Metadata != nil {
				if err := json.Unmarshal(signal.Metadata, &meta); err == nil {
					if meta.DurationSeconds > 0 { // Ensure duration is positive
						totalDurationSeconds += float64(meta.DurationSeconds)
						timeOnPageEventsCount++
					}
					if meta.DurationSeconds > 5 { // Consider time on page > 5s as interaction for bounce rate
						isInteractionEvent = true
					}
				}
			}
		}

		if isInteractionEvent {
			currentSessionActivity.hasInteraction = true
		}
	}

	var totalSessionsWithPageview int
	var bouncedSessionsCount int
	for _, activity := range sessions {
		if activity.hasPageview {
			totalSessionsWithPageview++
			if !activity.hasInteraction {
				bouncedSessionsCount++
			}
		}
	}

	if totalSessionsWithPageview > 0 {
		bounceRate = (float64(bouncedSessionsCount) / float64(totalSessionsWithPageview)) * 100.0
	}

	if timeOnPageEventsCount > 0 {
		avgTimeOnPageSeconds := totalDurationSeconds / float64(timeOnPageEventsCount)
		if avgTimeOnPageSeconds < 60 {
			avgTimeOnPageStr = fmt.Sprintf("%.2f s", avgTimeOnPageSeconds)
		} else if avgTimeOnPageSeconds < 3600 {
			avgTimeOnPageMinutes := avgTimeOnPageSeconds / 60
			avgTimeOnPageStr = fmt.Sprintf("%.2f m", avgTimeOnPageMinutes)
		} else {
			avgTimeOnPageHours := avgTimeOnPageSeconds / 3600
			avgTimeOnPageStr = fmt.Sprintf("%.2f h", avgTimeOnPageHours)
		}
	}

	if signups > 0 {
		conversionRate = (float64(signups) / float64(totalSessionsWithPageview)) * 100.0
	}

	return response.PublicIdeaStats{
		AvgTimeOnPage:  avgTimeOnPageStr,
		BounceRate:     bounceRate,
		ConversionRate: conversionRate,
		Signups:        signups,
	}
}
