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
	User      UserHandler
	Idea      IdeaHandler
	Feedback  FeedbackHandler
	Reaction  ReactionHandler
	MVP       MVPHandler
	Signal    SignalHandler
	Report    ReportHandler
	Dashboard DashboardHandler
	AI        AIHandler
}

func NewHandlers(services *service.Services) *Handlers {
	return &Handlers{
		User:      NewUserHandler(services.User),
		Idea:      NewIdeaHandler(services.Idea),
		Feedback:  NewFeedbackHandler(services.Feedback),
		Reaction:  NewReactionHandler(services.Reaction),
		MVP:       NewMVPHandler(services.MVP),
		Signal:    NewSignalHandler(services.Idea),
		Report:    NewReportHandler(services.Report),
		Dashboard: NewDashboardHandler(services.Dashboard),
		AI:        NewAIHandler(services.AI),
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

	order := c.DefaultQuery("order", "")
	sortBy := c.DefaultQuery("sortBy", "")
	filterBy := c.DefaultQuery("filterBy", "")
	search := c.DefaultQuery("search", "")

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
		Search:        search,
		LastCreatedAt: lastCreatedAt,
		LastId:        parsedLastId,
	}
}
