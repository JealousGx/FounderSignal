package validation

import (
	"fmt"
	"strings"

	"github.com/microcosm-cc/bluemonday"
	"golang.org/x/net/html"
)

type HTMLValidatorConfig struct {
	TailwindCSSUrl   string
	CTAButtonID      string
	AppUrl           string
	ScrollDebounceMs int
}

func GetValidatedHTML(
	bodyContent, metaTitle, metaDescription, ideaID, mvpID string, cfg HTMLValidatorConfig,
) (string, error) {
	// 1. Sanitize the HTML.
	sanitizedHTML, err := sanitizeHTML(bodyContent)
	if err != nil {
		return "", fmt.Errorf("html sanitization failed: %w", err)
	}

	// 2. Validate the HTML (e.g., check for CTA button).
	if err := validateHTML(sanitizedHTML, cfg.CTAButtonID); err != nil {
		return "", fmt.Errorf("html validation failed: %w", err)
	}

	// 3. Build the full HTML document.
	fullHTML := buildFullHTML(sanitizedHTML, metaTitle, metaDescription, ideaID, mvpID, cfg.CTAButtonID, cfg.TailwindCSSUrl, cfg.AppUrl, cfg.ScrollDebounceMs)

	return fullHTML, nil
}

func sanitizeHTML(bodyContent string) (string, error) {
	p := bluemonday.NewPolicy()

	p.AllowElements(
		"html", "head", "body", "title", "meta", "link", "header", "main", "section",
		"article", "aside", "footer", "nav", "h1", "h2", "h3", "h4", "h5", "h6",
		"p", "span", "div", "strong", "em", "ul", "ol", "li", "img", "a", "button",
		"form", "input", "label", "textarea", "iframe", "br", "hr", "figure",
		"figcaption", "blockquote", "style", "script",
	)

	p.AllowElements("svg", "path", "rect", "line", "circle", "text", "g", "source", "picture")

	p.AllowAttrs(
		"class", "id", "href", "src", "alt", "target", "rel", "data-*", "style",
		"width", "height", "viewBox", "fill", "stroke", "stroke-width", "stroke-linecap", "stroke-linejoin",
		"role", "aria-labelledby", "aria-label",
	).Globally()

	p.AllowAttrs("onclick").OnElements("button")

	p.AllowStandardURLs()
	p.AllowDataURIImages()

	sanitized := p.Sanitize(bodyContent)
	return sanitized, nil
}

// validateHTML checks for the CTA button's presence using Go's html parser.
func validateHTML(sanitizedHTML, ctaBtnID string) error {
	doc, err := html.Parse(strings.NewReader(sanitizedHTML))
	if err != nil {
		return fmt.Errorf("failed to parse html for validation: %w", err)
	}

	var hasCTAButton bool
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode && n.Data == "button" {
			for _, attr := range n.Attr {
				if attr.Key == "id" && attr.Val == ctaBtnID {
					hasCTAButton = true
					return
				}
			}
		}
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			if hasCTAButton {
				return
			}
			f(c)
		}
	}
	f(doc)

	if !hasCTAButton {
		return fmt.Errorf("missing required button with id '%s'", ctaBtnID)
	}
	return nil
}

// buildFullHTML creates the complete HTML document.
func buildFullHTML(bodyContent, metaTitle, metaDescription, ideaID, mvpID, ctaBtnID, tailwindCssUrl, appUrl string, scrollDebounceMs int) string {
	var trackingScript string
	// Check if the tracking script already exists in the content
	if !strings.Contains(bodyContent, `data-founder-signal-script="true"`) {
		trackingScript = getTrackingScript(ideaID, mvpID, ctaBtnID, appUrl, scrollDebounceMs)
	}

	return fmt.Sprintf(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>%s</title>
    <meta name="description" content="%s">
    <link href="%s" rel="stylesheet">
</head>
<body>
    %s
    %s
</body>
</html>`, metaTitle, metaDescription, tailwindCssUrl, bodyContent, trackingScript)
}

func getTrackingScript(ideaID, mvpID, ctaBtnID, appUrl string, scrollDebounceMs int) string {
	scriptTemplate := `<script data-founder-signal-script="true" data-cfasync="false">(function() {
            const ideaId = "%s";
            const mvpId = "%s";
            const appUrl = "%s";
            const ctaButtonId = "%s";

            // Helper function to post tracking events
            const postTrackEvent = (eventType, metadata) => {
                if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({
                        type: 'founderSignalTrack',
                        eventType: eventType,
                        ideaId: ideaId,
                        mvpId: mvpId,
                        metadata: metadata
                    }, appUrl);
                }
            };

            // 1. Track Page View
            postTrackEvent('pageview', { path: window.location.pathname, title: document.title });

            // 2. Track CTA Click
            const $ctaButton = document.getElementById(ctaButtonId);
            if ($ctaButton) {
                $ctaButton.addEventListener('click', function() {
                    postTrackEvent('cta_click', {
                        buttonText: $ctaButton.innerText,
                        ctaElementId: $ctaButton.id
                    });
                    alert('Thanks for your interest!');
                });
            }

            // 3. Track Scroll Depth
            let scrollReached = { '25': false, '50': false, '75': false, '100': false };
            let scrollTimeout;
            function handleScroll() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const docElem = document.documentElement;
                    const scrollHeight = docElem.scrollHeight - docElem.clientHeight;

                    if (scrollHeight === 0) {
                        if (!scrollReached['100']) {
                            postTrackEvent('scroll_depth', { percentage: 100 });
                            scrollReached['100'] = true;
                        }
                        return;
                    }
                    
                    const scrollTop = window.pageYOffset || docElem.scrollTop;
                    const currentPercentage = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

                    [25, 50, 75, 100].forEach(depth => {
                        if (currentPercentage >= depth && !scrollReached[depth.toString()]) {
                            postTrackEvent('scroll_depth', { percentage: depth });
                            scrollReached[depth.toString()] = true;
                        }
                    });
                }, %d);
            }
            handleScroll();
            window.addEventListener('scroll', handleScroll, { passive: true });

            // 4. Track Time on Page
            let startTime = Date.now();
            const sendTimeOnPage = () => {
                const durationSeconds = Math.round((Date.now() - startTime) / 1000);
                postTrackEvent('time_on_page', { duration_seconds: durationSeconds });
            };
            
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    sendTimeOnPage();
                }
            });
            window.addEventListener('pagehide', sendTimeOnPage);
        })();
    </script>`

	return fmt.Sprintf(
		scriptTemplate,
		ideaID,
		mvpID,
		appUrl,
		ctaBtnID,
		scrollDebounceMs,
	)
}
