package prompts

import (
	"bytes"
	"text/template"
)

const LandingPagePromptTemplate = `As an expert web developer, create a complete, single-file HTML landing page for a new startup idea.

**Instructions:**
1. The entire output must be a single HTML file. Do not wrap it in Markdown.
2. Use Tailwind CSS for all styling by including this exact CDN link in the "<head>": "<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">"
3. The landing page should be visually appealing, modern, and professional.
4. The structure should include a hero section, a features/benefits section (3-4 features), and a final call-to-action section.
5. **Crucially**, you MUST include the following JavaScript tracking script right before the closing "</body>" tag. Do NOT modify it.

<script data-founder-signal-script="true">(function() {
    const ideaId = "{{.IdeaID}}";
    const postTrackEvent = (eventType, metadata) => {
        if (window.parent && window.parent.postMessage) {
            window.parent.postMessage({ type: 'founderSignalTrack', eventType: eventType, ideaId: ideaId, metadata: metadata }, '*');
        }
    };

	// 1. Track Page View
    postTrackEvent('pageview', { path: window.location.pathname, title: document.title });

	// 2. Track CTA Click
    const $ctaButton = document.getElementById('ctaButton');
    if ($ctaButton) {
        $ctaButton.addEventListener('click', function() {
            postTrackEvent('cta_click', { buttonText: $ctaButton.innerText, ctaElementId: $ctaButton.id });
            alert('Thanks for your interest!');
        });
    }

	// 3. Track Scroll Depth
    let scrollReached = { 25: false, 50: false, 75: false, 100: false };
    let scrollTimeout;
    function handleScroll() {
        clearTimeout(scrollTimeout);

        scrollTimeout = setTimeout(() => {
            const docElem = document.documentElement;
            const scrollHeight = docElem.scrollHeight - docElem.clientHeight;
            if (scrollHeight === 0) {  // Content not scrollable or fully visible
                if (!scrollReached[100]) {
                    postTrackEvent('scroll_depth', { percentage: 100 });
                    scrollReached[100] = true;
                }
                return;
            }

            const scrollTop = window.pageYOffset || docElem.scrollTop;
            const currentPercentage = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));
            [25, 50, 75, 100].forEach(depth => {
                if (currentPercentage >= depth && !scrollReached[depth]) {
                    postTrackEvent('scroll_depth', { percentage: depth });
                    scrollReached[depth] = true;
                }
            });
        }, 150); // Debounce scroll events
    }
	// Initial check in case content is not scrollable but covers depths
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

	// 4. Track Time on Page
    const startTime = Date.now();
    const sendTimeOnPage = () => {
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        postTrackEvent('time_on_page', { duration_seconds: durationSeconds });
    };

	// More reliable way to send data on page unload
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            sendTimeOnPage();
        }
    });
	// As a fallback, though 'pagehide' or 'beforeunload' can be unreliable for async.
	// The postMessage should be synchronous enough.			
    window.addEventListener('pagehide', sendTimeOnPage);
})();</script>

6. Do not include any other "<script>" tags or external JavaScript files.
7. The main call-to-action button must have id="ctaButton".
8. The call-to-action button and section should not redirect to each other.
9. On  clicking the call-to-action button, it should show a popup with the message "Thanks for your interest!".
10. The landing page should not include any external links or references to other websites.
11. The landing page should be responsive and work well on both desktop and mobile devices.
12. Use semantic HTML5 elements where appropriate (e.g., <header>, <section>, <footer>).
13. Ensure the page is accessible, with proper alt text for images and ARIA roles where necessary.
14. The landing page should be SEO-friendly with appropriate meta tags.
15. Do not include anything else on your own, such as styling, scripts. The output will be strictly checked for compliance.
16. The landing page should be designed to convert visitors into leads or customers.

**Idea Details:**
*   **Idea Title/Name:** {{.Title}}
*   **Description:** {{.Description}}
*   **Target Audience:** {{.TargetAudience}}
*   **Call-to-Action Button Text:** {{.CTAButtonText}}
`

type LandingPagePromptData struct {
	IdeaID         string
	Title          string
	Description    string
	TargetAudience string
	CTAButtonText  string
}

func BuildLandingPagePrompt(data LandingPagePromptData) (string, error) {
	tmpl, err := template.New("landingPage").Parse(LandingPagePromptTemplate)
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}
