package request

type RecordSignalRequest struct {
	EventType string                 `json:"eventType" binding:"required,oneof=pageview cta_click scroll_depth time_on_page"`
	Metadata  map[string]interface{} `json:"metadata"`
}
