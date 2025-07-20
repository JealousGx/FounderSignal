"use server";

import { auth } from "@clerk/nextjs/server";

import { getSignedUrlForUpload } from "@/lib/cloudflare/r2";
import sharp from "sharp";

export const uploadImageWithSignedUrl = async (
  fileString: string,
  originalFileKey: string,
  originalContentType: string
): Promise<{
  error?: string;
  uploaded: boolean;
  imageUrl?: string;
}> => {
  try {
    const user = await auth();
    if (!user.userId) {
      return {
        error: "User not authenticated",
        uploaded: false,
      };
    }

    const binaryData = Buffer.from(fileString, "base64");

    let processedBuffer: Buffer = binaryData;
    let finalContentType: string = originalContentType;
    let finalFileKey: string = originalFileKey;

    const baseFileName = originalFileKey.split(".").slice(0, -1).join(".");

    if (
      originalContentType.startsWith("image/") &&
      originalContentType !== "image/svg+xml"
    ) {
      try {
        const image = sharp(binaryData);

        const outputFormat = "webp";
        const quality = 80;
        const maxWidth = 1200;
        const maxHeight = 1200;

        processedBuffer = await image
          .resize({
            width: maxWidth,
            height: maxHeight,
            fit: sharp.fit.inside,
            withoutEnlargement: true,
          })
          .toFormat(outputFormat, { quality: quality })
          .toBuffer();

        finalContentType = `image/${outputFormat}`;
        finalFileKey = `${baseFileName}.${outputFormat}`;

        console.log(
          `Server-side processed image to ${outputFormat}: Original size ${binaryData.length} bytes, New size ${processedBuffer.length} bytes`
        );
      } catch (sharpError) {
        console.error(
          "Sharp image processing failed, uploading original image:",
          sharpError
        );
        processedBuffer = binaryData;
        finalContentType = originalContentType;
        finalFileKey = originalFileKey;
      }
    } else if (originalContentType === "image/svg+xml") {
      processedBuffer = binaryData;
      finalContentType = originalContentType;
      finalFileKey = originalFileKey;
    } else {
      processedBuffer = binaryData;
      finalContentType = originalContentType;
      finalFileKey = originalFileKey;
    }

    const { signedUrl, key } = await getSignedUrlForUpload(
      finalFileKey,
      finalContentType
    );

    if (!signedUrl) {
      return {
        error: "Failed to generate signed URL",
        uploaded: false,
      };
    }

    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": finalContentType,
      },
      body: processedBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error uploading image to R2:", errorText);

      return {
        error: "Failed to upload image to storage",
        uploaded: false,
      };
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_R2_ENDPOINT}/${key}`;

    return {
      uploaded: true,
      imageUrl,
    };
  } catch (error) {
    console.error("Unhandled error during image upload:", error);

    return {
      error: "An unexpected error occurred during image upload.",
      uploaded: false,
    };
  }
};
