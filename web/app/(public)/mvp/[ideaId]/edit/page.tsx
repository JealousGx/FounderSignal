"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import grapesjs, { Asset, Assets, Component, Editor } from "grapesjs";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import grapesjsPresetWebpage from "grapesjs-preset-webpage";
import "grapesjs/dist/css/grapes.min.css";
import "grapesjs/dist/grapes.min.js";

import { getMVP } from "../action";
import { deleteAsset, updateMVP } from "./action";
import { FloatingActionMenu } from "./floating-menu";
import {
  extractFileNameFromUrl,
  getImageFileName,
  updateHtmlWithImageUrls,
} from "./helpers";
import { MetaSettingsModal } from "./meta-settings";
import { getValidatedHtml } from "./validation";

import { uploadImageWithSignedUrl } from "@/components/shared/image-upload/actions";

const CTA_BUTTON_ID = "ctaButton";

export default function EditLandingPage() {
  const params = useParams();
  const ideaId = Array.isArray(params.ideaId)
    ? params.ideaId[0]
    : params.ideaId;

  const [saving, setSaving] = useState(false);
  const [grapeEditor, setGrapeEditor] = useState<Editor | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAssets, setCurrentAssets] = useState<Set<string>>(new Set());

  const editorRef = useRef<HTMLDivElement>(null);

  const updateEditorData = useCallback(
    (html: string) => {
      if (!grapeEditor) return;

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const title = doc.querySelector("title")?.textContent || "";
      const desc =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") || "";

      setMetaTitle(title);
      setMetaDescription(desc);

      // remove any script / link tags from the body.
      // only set the body content
      doc.body.querySelectorAll("script, link").forEach((el) => el.remove());
      const bodyContent = doc.body.innerHTML;
      grapeEditor.setComponents(bodyContent);
    },
    [grapeEditor]
  );

  // GrapeJS init
  useEffect(() => {
    if (!editorRef.current || grapeEditor) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: true,
      height: "100vh",
      width: "100%",
      storageManager: false,
      assetManager: {},
      plugins: [grapesjsBlocksBasic, grapesjsPresetWebpage],
      canvas: {
        styles: [
          "https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css",
        ],
      },
    });

    setGrapeEditor(editor);

    return () => {
      editor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (ideaId && grapeEditor) {
      getMVP(ideaId).then((data) => {
        if (data.htmlContent) {
          try {
            updateEditorData(data.htmlContent);

            const parser = new DOMParser();
            const doc = parser.parseFromString(data.htmlContent, "text/html");

            // Track existing assets from loaded HTML
            const images = doc.querySelectorAll("img[src]");
            const existingAssets = new Set<string>();
            images.forEach((img) => {
              const src = img.getAttribute("src");
              if (src && !src.startsWith("data:")) {
                const fileName = extractFileNameFromUrl(src);
                if (fileName) {
                  existingAssets.add(fileName);
                }
              }
            });

            setCurrentAssets(existingAssets);
          } catch (error) {
            console.error("Failed to parse existing HTML:", error);
            toast.error("Could not load existing page content.");
          }
        }
      });
    }
  }, [ideaId, grapeEditor, updateEditorData]);

  // Track asset changes and handle removals
  useEffect(() => {
    if (!grapeEditor) return;

    const handleAssetRemove = async (asset: Asset) => {
      const assetSrc = asset.get("src");
      if (!assetSrc || assetSrc.startsWith("data:")) return;

      // Extract fileName from the cloud URL
      const fileName = extractFileNameFromUrl(assetSrc);
      if (!fileName) return;

      console.log("Asset removed from editor:", fileName);

      try {
        const result = await deleteAsset(fileName);
        if (result.error) {
          console.error("Failed to delete asset:", result.error);
          toast.error(`Failed to delete asset: ${result.error}`);
        } else {
          console.log("Asset deleted from cloud:", fileName);
          // Remove from current assets tracking
          setCurrentAssets((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fileName);
            return newSet;
          });
        }
      } catch (error) {
        console.error("Error deleting asset:", error);
        toast.error("Failed to delete asset from cloud storage");
      }
    };

    // Handle component removal to check for orphaned assets
    const handleComponentRemove = async (component: Component) => {
      // Get all images in the removed component
      const images = component.findType("image");

      for (const img of images) {
        const src = img.getAttributes().src;
        if (src && !src.startsWith("data:")) {
          const fileName = extractFileNameFromUrl(src);
          if (fileName && currentAssets.has(fileName)) {
            // Check if this image is still used elsewhere in the editor
            const allComponents = grapeEditor.getComponents();
            const isStillUsed = allComponents.find((comp: Component) => {
              const compImages = comp.findType("image");
              return compImages.some(
                (img: Component) => img.getAttributes().src === src
              );
            });

            if (!isStillUsed) {
              console.log("Orphaned asset detected:", fileName);
              try {
                const result = await deleteAsset(fileName);
                if (result.error) {
                  console.error(
                    "Failed to delete orphaned asset:",
                    result.error
                  );
                } else {
                  console.log("Orphaned asset deleted from cloud:", fileName);
                  setCurrentAssets((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(fileName);
                    return newSet;
                  });
                }
              } catch (error) {
                console.error("Error deleting orphaned asset:", error);
              }
            }
          }
        }
      }
    };

    // Listen for asset removal events
    grapeEditor.on("asset:remove", handleAssetRemove);
    grapeEditor.on("component:remove", handleComponentRemove);

    return () => {
      grapeEditor.off("asset:remove", handleAssetRemove);
      grapeEditor.off("component:remove", handleComponentRemove);
    };
  }, [grapeEditor, currentAssets]);

  const handleImageUploads = useCallback(
    async (assets: Assets) => {
      if (!ideaId) return new Map<string, string>();

      const assetsToUpload = assets.models.filter((m: Asset) =>
        (m.id as string).startsWith("data:image")
      ) as Asset[];

      if (!assetsToUpload || assetsToUpload.length === 0)
        return new Map<string, string>();

      console.log("Found assets to upload:", assetsToUpload.length);

      const uploadPromises = assetsToUpload.map(async (asset) => {
        const dataUrl = asset.id as string;
        const fileName = getImageFileName(ideaId, asset.attributes.name);

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

        // Add to current assets tracking
        setCurrentAssets((prev) => new Set(prev).add(fileName));

        return { base64String: dataUrl, cloudUrl: uploadResponse.imageUrl };
      });

      const uploadedAssets = await Promise.all(uploadPromises);
      const urlMap = new Map(
        uploadedAssets.map((a) => [a.base64String, a.cloudUrl])
      );

      assets.forEach((asset: Asset) => {
        const currentSrc = asset.get("src");
        if (urlMap.has(currentSrc)) {
          const newSrc = urlMap.get(currentSrc);

          console.log(
            "Replacing asset src:",
            currentSrc.substring(0, 50) + "...",
            "->",
            newSrc
          );

          asset.set("src", newSrc);
        }
      });

      return urlMap;
    },
    [ideaId]
  );

  const cleanupOrphanedAssets = useCallback(
    async (finalHtml: string) => {
      try {
        // Parse the final HTML to get all image sources
        const parser = new DOMParser();
        const doc = parser.parseFromString(finalHtml, "text/html");
        const images = doc.querySelectorAll("img[src]");

        const usedAssets = new Set<string>();
        images.forEach((img) => {
          const src = img.getAttribute("src");
          if (src && !src.startsWith("data:")) {
            const fileName = extractFileNameFromUrl(src);
            if (fileName) {
              usedAssets.add(fileName);
            }
          }
        });

        // Find orphaned assets (in currentAssets but not in usedAssets)
        const orphanedAssets = Array.from(currentAssets).filter(
          (asset) => !usedAssets.has(asset)
        );

        if (orphanedAssets.length === 0) return;

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
        setCurrentAssets(usedAssets);
      } catch (error) {
        console.error("Error during asset cleanup:", error);
      }
    },
    [currentAssets]
  );

  const handleSave = useCallback(async () => {
    if (!ideaId || !grapeEditor) return;

    try {
      const bodyContent = grapeEditor.getHtml({ cleanId: true });

      if (!bodyContent.trim()) {
        toast.error("Please add some content before saving.");
        return;
      }

      const uploadedAssetsRes = await handleImageUploads(
        grapeEditor.AssetManager.getAllVisible()
      );

      const validatedHtmlRes = getValidatedHtml(
        ideaId,
        bodyContent,
        metaTitle,
        metaDescription,
        CTA_BUTTON_ID
      );

      const { isValid, errorMessage } = validatedHtmlRes;
      let html = validatedHtmlRes.html;

      if (!html || !isValid) {
        toast.error(
          errorMessage || "Invalid HTML content. Please fix errors.",
          {
            duration: 5000,
          }
        );

        return;
      }

      // Replace all base64 strings in the HTML with the new cloud URLs
      html = updateHtmlWithImageUrls(uploadedAssetsRes, html);

      updateEditorData(html);
      // Clean up orphaned assets
      await cleanupOrphanedAssets(html);

      setSaving(true);

      const data = await updateMVP(ideaId, html);
      if (data.error) throw new Error(data.error || "Save failed");

      toast.success("Landing page saved!");
    } catch (error) {
      const err = error as Error;
      toast.error(err.message || "Failed to save landing page.");
    } finally {
      setSaving(false);
    }
  }, [
    ideaId,
    grapeEditor,
    handleImageUploads,
    metaTitle,
    metaDescription,
    updateEditorData,
    cleanupOrphanedAssets,
  ]);

  return (
    <div className="relative w-full h-screen">
      <div ref={editorRef} className="w-full h-full">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-center mb-8">
            Your Landing Page
          </h1>
          <p className="text-lg text-center mb-8">
            Start building your MVP landing page!
          </p>
          <div className="text-center">
            <button
              id="ctaButton"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      <FloatingActionMenu
        onSave={handleSave}
        onSettingsClick={() => setIsModalOpen(true)}
        isSaving={saving}
      />

      <MetaSettingsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        metaTitle={metaTitle}
        setMetaTitle={setMetaTitle}
        metaDescription={metaDescription}
        setMetaDescription={setMetaDescription}
      />
    </div>
  );
}
