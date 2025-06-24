package request

type AIGenerate struct {
	Prompt string `json:"prompt" binding:"required"`
}
