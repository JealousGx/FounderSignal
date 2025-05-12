package response

type MVP struct {
	HTMLContent string `json:"htmlContent"`
}

type UpdateMVP struct {
	Headline    string `json:"headline"`
	Subheadline string `json:"subheadline"`
	CTAButton   string `json:"ctaButton"`
	CTAText     string `json:"ctaText"`
}
