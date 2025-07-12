"use server";

import { auth } from "@clerk/nextjs/server";

import { getSignedUrlForUpload } from "@/lib/r2";

export const uploadImageWithSignedUrl = async (
  fileString: string,
  fileKey: string,
  contentType: string
): Promise<{
  error?: string;
  uploaded: boolean;
  imageUrl?: string;
}> => {
  try {
    const user = await auth();
    if (!user) {
      return {
        error: "User not authenticated",
        uploaded: false,
      };
    }

    const { signedUrl, key } = await getSignedUrlForUpload(
      fileKey,
      contentType
    );

    if (!signedUrl) {
      return {
        error: "Failed to generate signed URL",
        uploaded: false,
      };
    }

    const binaryData = Buffer.from(fileString, "base64");

    const response = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: binaryData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error uploading image:", errorText);

      return {
        error: "Failed to upload image",
        uploaded: false,
      };
    }

    const imageUrl = `${process.env.NEXT_PUBLIC_R2_ENDPOINT}/${key}`;

    return {
      uploaded: true,
      imageUrl,
    };
  } catch (error) {
    console.error("Error uploading image:", error);

    return {
      error: "Failed to generate signed URL",
      uploaded: false,
    };
  }
};
