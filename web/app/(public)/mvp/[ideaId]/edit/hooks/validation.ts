import DOMPurify from "dompurify";

import { getTrackingScript } from "./tracking-script";

const TAILWIND_CSS_URL =
  "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css";

export function getValidatedHtml(
  ideaId: string,
  bodyContent: string,
  styles: string | undefined,
  metaTitle: string,
  metaDescription: string,
  ctaBtnId: string
) {
  // Sanitize with a stricter policy to prevent XSS
  const cleanBodyContent = DOMPurify.sanitize(bodyContent, {
    // Disallow script tags and inline event handlers from user content
    FORBID_TAGS: ["script"],
    FORBID_ATTR: [
      "onclick",
      "onerror",
      "onload",
      "onmouseover",
      "onsubmit",
      "onfocus",
      "onblur",
      "onchange",
      "oninput",
    ],
    // Allow necessary tags and attributes for a page builder
    ADD_TAGS: [
      "html",
      "head",
      "body",
      "title",
      "meta",
      "link",
      "header",
      "main",
      "section",
      "article",
      "aside",
      "footer",
      "nav",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span",
      "div",
      "strong",
      "em",
      "ul",
      "ol",
      "li",
      "img",
      "a",
      "button",
      "form",
      "input",
      "label",
      "textarea",
      "iframe",
      "br",
      "hr",
      "figure",
      "figcaption",
      "blockquote",
    ],
    ADD_ATTR: ["class", "id", "href", "src", "alt", "target", "rel"],
    KEEP_CONTENT: true,
    ALLOW_DATA_ATTR: true,
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  const trackingScriptExists = cleanBodyContent.includes(
    'data-founder-signal-script="true"'
  );

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaTitle}</title>
    <meta name="description" content="${metaDescription}">
    <link href="${TAILWIND_CSS_URL}" rel="stylesheet">
    <style>
        ${styles || ""}
    </style>
</head>
<body>
    ${cleanBodyContent}
    ${trackingScriptExists ? "" : getTrackingScript(ideaId, ctaBtnId)}
</body>
</html>`;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, "text/html");

    const ctaButtons = doc.querySelectorAll(`#${ctaBtnId}`);
    if (ctaButtons.length === 0) {
      return {
        html: "",
        isValid: false,
        errorMessage: `You must have at least one <button> with id='${ctaBtnId}' for tracking to work.`,
      };
    }

    for (const el of ctaButtons) {
      if (el.tagName.toLowerCase() !== "button") {
        return {
          html: "",
          isValid: false,
          errorMessage: `The id '${ctaBtnId}' can only be used on <button> elements.`,
        };
      }
    }
  } catch (error) {
    console.error("Error validating HTML:", error);
    return {
      html: "",
      isValid: false,
      errorMessage: "HTML validation failed.",
    };
  }

  return { html: fullHtml, isValid: true, errorMessage: "" };
}
