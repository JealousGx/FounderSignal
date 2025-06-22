export const getImageFileName = (ideaId: string, imageName: string) => {
  return `${ideaId}/${imageName}`;
};

export const extractFileNameFromUrl = (url: string): string | null => {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url);
    const path = urlObj.pathname;

    // Remove leading slash and return the path
    return path.startsWith("/") ? path.substring(1) : path;
  } catch (error) {
    console.error("Error extracting fileName from URL:", error);
    return null;
  }
};

export const optimizeHtmlImages = (
  html: string,
  urlMap: Map<
    string,
    { cloudUrl: string; dimensions: { width: number; height: number } }
  >
): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const images = doc.querySelectorAll("img");
  let isFirstImage = true;

  images.forEach((img) => {
    const originalSrc = img.getAttribute("src");

    // Replace src and add dimensions for newly uploaded images
    if (originalSrc && urlMap.has(originalSrc)) {
      const assetData = urlMap.get(originalSrc)!;
      img.setAttribute("src", assetData.cloudUrl);
      img.setAttribute("width", String(assetData.dimensions.width));
      img.setAttribute("height", String(assetData.dimensions.height));
    }

    // --- General Optimizations ---
    // Responsive images
    img.setAttribute("style", "max-width:100%;height:auto");

    // Add async decoding to all images
    img.setAttribute("decoding", "async");

    // Prioritize the first image (potential LCP element)
    if (isFirstImage) {
      img.removeAttribute("loading"); // Eager is default, but remove just in case
      img.setAttribute("fetchpriority", "high");
      isFirstImage = false;
    } else {
      // Lazy load all other images
      img.setAttribute("loading", "lazy");
    }

    // Ensure alt attribute exists for accessibility
    if (!img.hasAttribute("alt") || img.getAttribute("alt") === "") {
      const currentSrc = img.getAttribute("src");
      if (currentSrc) {
        try {
          const pathname = new URL(currentSrc).pathname;
          const filenameWithExt = pathname.substring(
            pathname.lastIndexOf("/") + 1
          );

          // Remove the extension
          const filename =
            filenameWithExt.lastIndexOf(".") > 0
              ? filenameWithExt.substring(0, filenameWithExt.lastIndexOf("."))
              : filenameWithExt;

          // A simple transformation for better alt text
          const altText = decodeURIComponent(filename).replace(/[-_]/g, " ");
          img.setAttribute("alt", altText);
        } catch {
          // If src is not a valid URL or something goes wrong, set an empty alt attribute
          img.setAttribute("alt", "");
        }
      }
    }
  });

  return doc.documentElement.outerHTML;
};
