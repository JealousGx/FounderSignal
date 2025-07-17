export const getImageFileName = (
  ideaId: string,
  mvpId: string,
  imageName: string
) => {
  return `${ideaId}/${mvpId}/${encodeURIComponent(imageName)}`;
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

    // Add a fade transition class if not already present
    if (!img.classList.contains("image-transition")) {
      img.classList.add("image-transition");
      img.style.transition = "opacity 0.3s ease-in-out";
    }

    // Temporarily reduce opacity for smooth transition
    img.style.opacity = "0.7";

    // --- General Optimizations ---
    // Responsive images
    const existingStyle = img.getAttribute("style") || "";
    const newStyle = "max-width:100%;height:auto";
    img.setAttribute(
      "style",
      `${existingStyle}${existingStyle ? ";" : ""}${newStyle}`
    );

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

// Preload images to prevent flickering when replacing base64 with cloud URLs
export const preloadImages = async (
  urlMap: Map<
    string,
    { cloudUrl: string; dimensions: { width: number; height: number } }
  >
) => {
  const preloadPromises = Array.from(urlMap.values()).map(({ cloudUrl }) => {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () =>
        reject(new Error(`Failed to preload image: ${cloudUrl}`));
      img.src = cloudUrl;
    });
  });

  try {
    await Promise.all(preloadPromises);
    console.log("All images preloaded successfully");
  } catch (error) {
    console.warn("Some images failed to preload:", error);
  }
};
