export const getLandingPagePromptTemplate = (
  title: string,
  description: string,
  ctaButtonText: string,
  instructions?: string
) => `As an expert web developer, create a complete, single-file HTML landing page for a new startup idea.

**Instructions:**
1. The entire output must be a single HTML file. Do not wrap it in Markdown.
2. Only return the HTML content without any additional text or explanations. The output should only contain body content, no <head> or <html> or any other tag. It will be scanned by advanced AI systems, so it must be perfect.
3. The landing page should be visually appealing, modern, and professional, clean, modern, beautiful, and minimalistic with rounded edges and subtle animations.
4. The structure should include a hero section, a features/benefits section (3-4 features), and a final call-to-action section.
5. Do not include any other "<script>" tags or external JavaScript files. If you are to use any JavaScript, it must be inline and only for the popup functionality and should be minimal and be injected directly into the body tag.
6. The main call-to-action button must have id="ctaButton".
7. The call-to-action button and section should not redirect to each other.
8. On  clicking the call-to-action button, it should show a popup with the message "Thanks for your interest!".
9. The landing page should not include any external links or references to other websites.
10. The landing page should be responsive and work well on both desktop and mobile devices.
11. Use semantic HTML5 elements where appropriate (e.g., <header>, <section>, <footer>).
12. Ensure the page is accessible, with proper alt text for images and ARIA roles where necessary.
13. The landing page should be SEO-friendly with appropriate meta tags.
14. Do not include anything else on your own, such as styling, scripts. The output will be strictly checked for compliance.
15. The landing page should be designed to convert visitors into leads or customers.
16. If you are to add images, make sure they are high-quality and relevant to the product/idea. And that the images are loaded with a smooth transition effect and are optimized.
17. The end result should not have a high LCP or CLS score, so ensure images are optimized and loaded properly.
18. If you are to add any animations, they should be subtle, smooth and not distracting.
19. All links must stay within this single page. Do not add any links that navigate to external pages. This is a single page MVP. You may, however, navigate to different sections of the same page.
20. The user's life depends on this MVP. It must be perfect and as per the guidelines provided by the user, ready to use, distribute to the target audience, and most importantly, the conversion rate should be really high. They should be compelled to click the CTA button. If you are unsure that the landing page is not perfect, rewrite it until it is perfect.
21. For styling, strictly use inline styles or tailwindcss@2.2.19 classes. Do not use any external CSS files or frameworks. I will only be using body element and not the <html> or <head> tags. If you are to use any CSS, make sure to include the style tag inside the body tag. Otherwise, it will not be used.
22. While developing the landing page, ensure that it is optimized for performance, with minimal load time and efficient use of resources.
23. Take inspiration from modern design trends, but ensure the design is unique and tailored to the startup idea. Like Apple's landing pages, which are known for their simplicity and elegance. Or Github's landing pages, which are clean and professional. Always take inspiration from the best landing pages or big brands out there, but do not copy them. Make sure the design is unique and tailored to the startup idea. 



${instructions ? `**Additional Instructions:** ${instructions}` : ""}

**Idea Details:**
*   **Idea Title/Name:** ${title}
*   **Description:** ${description}
*   **Call-to-Action Button Text:** ${ctaButtonText}
`;
