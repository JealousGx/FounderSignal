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

export const updateHtmlWithImageUrls = (
  base64ToUrlMap: Map<string, string>,
  html: string
) => {
  base64ToUrlMap.forEach((cloudUrl, base64Src) => {
    const escapedSrc = base64Src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const beforeCount = (html!.match(new RegExp(escapedSrc, "g")) || []).length;

    html = html!.replace(new RegExp(escapedSrc, "g"), cloudUrl);

    const afterCount = (html!.match(new RegExp(cloudUrl, "g")) || []).length;

    console.log(
      `Replaced ${beforeCount} occurrences of base64 with ${afterCount} cloud URLs`
    );
  });

  return html;
};
