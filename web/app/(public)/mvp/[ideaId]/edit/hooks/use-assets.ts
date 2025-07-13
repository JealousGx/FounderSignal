import { Asset, Assets, Component, Components, Editor } from "grapesjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { uploadImageWithSignedUrl } from "@/components/shared/image-upload/actions";
import { deleteAsset } from "./actions";
import {
  extractFileNameFromUrl,
  getImageFileName,
  preloadImages,
} from "./helpers";

export type AssetUrlMap = Map<
  string,
  { cloudUrl: string; dimensions: { width: number; height: number } }
>;

export function useAssets(
  ideaId: string | undefined,
  grapeEditor: Editor | null
) {
  const [currentAssets, setCurrentAssets] = useState<Set<string>>(new Set());
  const [assetsMarkedForDeletion, setAssetsMarkedForDeletion] = useState<
    Set<string>
  >(new Set());
  const assetUrlMapRef = useRef<AssetUrlMap>(new Map());

  if (!ideaId) {
    throw new Error("Idea ID is required for asset management");
  }

  // Update image sources in GrapeJS editor without full re-render
  const updateImageSources = useCallback(
    (
      urlMap: Map<
        string,
        { cloudUrl: string; dimensions: { width: number; height: number } }
      >
    ) => {
      if (!grapeEditor) return;

      const allComps = grapeEditor.getWrapper()?.get("components");
      const imageComponents: Component[] = [];

      const findImageComponents = (components: Components) => {
        components.forEach((comp: Component) => {
          if (comp.get("type") === "image") {
            imageComponents.push(comp);
          }

          const innerComponents = comp.get("components");
          if (innerComponents?.length) {
            findImageComponents(innerComponents);
          }
        });
      };

      if (allComps) {
        findImageComponents(allComps);
      }

      imageComponents.forEach((img) => {
        const currentSrc = img.getAttributes().src;
        if (currentSrc && urlMap.has(currentSrc)) {
          const assetData = urlMap.get(currentSrc)!;

          // Update the image source and dimensions
          img.setAttributes({
            src: assetData.cloudUrl,
            width: assetData.dimensions.width,
            height: assetData.dimensions.height,
          });

          console.log("Updated image source in editor:", assetData.cloudUrl);
        }
      });

      // also update the asset manager
      const assetManager = grapeEditor.AssetManager;
      if (assetManager) {
        urlMap.forEach((data, base64String) => {
          assetManager.remove(base64String);

          if (!assetManager.get(data.cloudUrl)) {
            assetManager.add({
              src: data.cloudUrl,
              width: data.dimensions.width,
              height: data.dimensions.height,
            });
          }
        });
      }
    },
    [grapeEditor]
  );

  const handleImageUploads = useCallback(
    async (assets: Assets) => {
      if (!ideaId) return new Map();

      const assetsToUpload = assets.models.filter(
        (m: Asset) => typeof m.id === "string" && m.id.startsWith("data:image")
      ) as Asset[];

      if (!assetsToUpload || assetsToUpload.length === 0) return new Map();

      console.log("Found assets to upload:", assetsToUpload.length);

      const uploadPromises = assetsToUpload.map(async (asset) => {
        const dataUrl = asset.id as string;
        const fileName = getImageFileName(ideaId, asset.attributes.name);

        const dimensions = {
          width: asset.attributes.width,
          height: asset.attributes.height,
        };

        // Extract content type and base64 data from data URL
        const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
        if (!matches) {
          throw new Error("Invalid data URL format");
        }

        const [, contentType, base64String] = matches;

        console.log("Uploading image:", fileName, "Content-Type:", contentType);

        const uploadResponse = await uploadImageWithSignedUrl(
          base64String,
          fileName,
          contentType
        );
        if (uploadResponse.error || !uploadResponse.imageUrl) {
          toast.error(
            `Failed to upload image: ${uploadResponse.error}. Please try again.`,
            {
              duration: 5000,
            }
          );

          throw new Error(uploadResponse.error || "Upload failed");
        }

        console.log("Image uploaded successfully:", uploadResponse.imageUrl);

        return {
          base64String: dataUrl,
          cloudUrl: uploadResponse.imageUrl,
          dimensions,
          fileName,
        };
      });

      const uploadedAssets = await Promise.all(uploadPromises);

      const newFileNames = uploadedAssets
        .map((asset) => extractFileNameFromUrl(asset.cloudUrl))
        .filter((name) => name !== null);
      setCurrentAssets((prev) => new Set([...prev, ...newFileNames]));

      setAssetsMarkedForDeletion((prev) => {
        const newState = new Set(prev);
        newFileNames.forEach((fileName) => newState.delete(fileName));
        return newState;
      });

      const urlMap = new Map(
        uploadedAssets.map((a) => [
          a.base64String,
          { cloudUrl: a.cloudUrl, dimensions: a.dimensions },
        ])
      );

      const combinedMap = new Map([...assetUrlMapRef.current, ...urlMap]);
      assetUrlMapRef.current = combinedMap;

      await preloadImages(urlMap);
      updateImageSources(urlMap);

      return combinedMap;
    },
    [ideaId, updateImageSources]
  );

  const cleanupOrphanedAssets = useCallback(
    async (finalHtml: string) => {
      // Parse the final HTML to get all image sources
      const parser = new DOMParser();
      const doc = parser.parseFromString(finalHtml, "text/html");
      const images = doc.querySelectorAll("img[src]");

      const usedAssetsInHtml = new Set<string>();
      images.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && !src.startsWith("data:")) {
          const fileName = extractFileNameFromUrl(src);
          if (fileName) {
            usedAssetsInHtml.add(fileName);
          }
        }
      });

      const actualUsedAssets = new Set(
        Array.from(usedAssetsInHtml).filter(
          (fileName) => !assetsMarkedForDeletion.has(fileName)
        )
      );

      const assetsToConsiderForDeletion = new Set([
        ...Array.from(currentAssets),
        ...Array.from(assetsMarkedForDeletion), // Include assets explicitly marked for deletion
      ]);

      // Find orphaned assets (in assetsToConsiderForDeletion but not in usedAssets)
      const orphanedAssets = Array.from(assetsToConsiderForDeletion).filter(
        (asset) => !actualUsedAssets.has(asset)
      );

      if (orphanedAssets.length === 0) {
        setCurrentAssets(actualUsedAssets);
        setAssetsMarkedForDeletion(new Set());

        return;
      }

      console.log("Cleaning up orphaned assets:", orphanedAssets.length);

      // Delete orphaned assets
      const deletePromises = orphanedAssets.map(async (fileName) => {
        try {
          const result = await deleteAsset(fileName);
          if (result.error) {
            console.error(
              "Failed to delete orphaned asset:",
              fileName,
              result.error
            );

            return { fileName, success: false, error: result.error };
          } else {
            console.log("Orphaned asset deleted:", fileName);

            return { fileName, success: true };
          }
        } catch (error) {
          console.error("Error deleting orphaned asset:", fileName, error);

          return { fileName, success: false, error: error };
        }
      });

      const results = await Promise.all(deletePromises);
      const failedDeletions = results.filter((r) => !r.success);

      if (failedDeletions.length > 0) {
        console.warn(
          "Some orphaned assets could not be deleted:",
          failedDeletions
        );
      }

      // Update current assets tracking
      setCurrentAssets(actualUsedAssets);
      setAssetsMarkedForDeletion(new Set());
    },
    [currentAssets, assetsMarkedForDeletion]
  );

  const handleAssetRemove = useCallback(async (asset: Asset) => {
    const assetSrc = asset.get("src");
    if (assetSrc && !assetSrc.startsWith("data:")) {
      const fileName = extractFileNameFromUrl(assetSrc);
      if (fileName) {
        console.log("Marking asset for deletion:", fileName);
        setAssetsMarkedForDeletion((prev) => new Set([...prev, fileName]));
      }
    }
  }, []);

  useEffect(() => {
    if (grapeEditor) {
      // Listen for the asset:remove event to mark assets for deletion
      grapeEditor.on("asset:remove", handleAssetRemove);

      // Cleanup on unmount or editor change
      return () => {
        grapeEditor.off("asset:remove", handleAssetRemove);
      };
    }
  }, [grapeEditor, handleAssetRemove]);

  return {
    currentAssets,
    setCurrentAssets,
    handleImageUploads,
    cleanupOrphanedAssets,
    assetUrlMapRef,
  };
}
