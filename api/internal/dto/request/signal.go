package request

type RecordSignalRequest struct {
	EventType string                 `json:"eventType" binding:"required"`
	Metadata  map[string]interface{} `json:"metadata"`
}
