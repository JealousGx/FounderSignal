package http

import (
	"fmt"
	"foundersignal/internal/domain"
	"foundersignal/internal/service"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type Handlers struct {
	Idea      IdeaHandler
	Feedback  FeedbackHandler
	Reaction  ReactionHandler
	MVP       MVPHandler
	Signal    SignalHandler
	Dashboard DashboardHandler
}

func NewHandlers(services *service.Services) *Handlers {
	return &Handlers{
		Idea:      NewIdeaHandler(services.Idea),
		Feedback:  NewFeedbackHandler(services.Feedback),
		Reaction:  NewReactionHandler(services.Reaction),
		MVP:       NewMVPHandler(services.MVP),
		Signal:    NewSignalHandler(services.Idea),
		Dashboard: NewDashboardHandler(services.Dashboard),
	}
}

func getProcessedQueryParams(c *gin.Context) domain.QueryParams {
	limitStr := c.Query("limit")
	var limit int
	var err error
	if limitStr != "" {
		limit, err = strconv.Atoi(limitStr)
		if err != nil {
			fmt.Println("Error parsing limit:", err)
		}
	}

	offset, err := strconv.Atoi(c.Query("offset"))
	if err != nil {
		offset = 0
	}

	order := c.Query("order")
	sortBy := c.Query("sortBy")
	filterBy := c.Query("filterBy")

	lastCreatedAt, err := time.Parse(time.RFC3339Nano, c.Query("lastCreatedAt"))
	if err != nil {
		lastCreatedAt = time.Time{}
	}

	lastId := c.Query("lastId")
	var parsedLastId uuid.UUID
	if lastId != "" {
		parsedLastId, err = uuid.Parse(lastId)
		if err != nil {
			parsedLastId = uuid.Nil
		}
	}

	return domain.QueryParams{
		Limit:         limit,
		Offset:        offset,
		Order:         order,
		SortBy:        sortBy,
		FilterBy:      filterBy,
		LastCreatedAt: lastCreatedAt,
		LastId:        parsedLastId,
	}
}
