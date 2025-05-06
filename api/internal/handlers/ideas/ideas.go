package ideas

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type Idea struct {
  ID      int    `json:"id"`
  UserID  int    `json:"userId"`
  Title   string `json:"title"`
  Description string `json:"description"`
  CreatedAt string `json:"created_at"`
  UpdatedAt string `json:"updated_at"`
}

var ideas = []Idea{
  {ID: 1, UserID: 1, Title: "Idea 1", Description: "Description for Idea 1", CreatedAt: "2023-01-01", UpdatedAt: "2023-01-02"},
  {ID: 2, UserID: 1, Title: "Idea 2", Description: "Description for Idea 2", CreatedAt: "2023-01-03", UpdatedAt: "2023-01-04"},
  {ID: 3, UserID: 2, Title: "Idea 3", Description: "Description for Idea 3", CreatedAt: "2023-01-05", UpdatedAt: "2023-01-06"},
}

func GetIdeas(c *gin.Context) {
  c.IndentedJSON(http.StatusOK, ideas)
}