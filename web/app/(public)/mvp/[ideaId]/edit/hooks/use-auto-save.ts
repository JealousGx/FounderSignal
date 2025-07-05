import { Assets, Editor } from "grapesjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { createMVP, updateMVP } from "./actions";
import { optimizeHtmlImages } from "./helpers";
import { AssetUrlMap } from "./use-assets";
import { getValidatedHtml } from "./validation";

const CTA_BUTTON_ID = "ctaButton";
const AUTOSAVE_DELAY = 2 * 60 * 1000; // 2 minutes

export type SaveStatus = "idle" | "saving" | "success" | "error";

export function useAutoSave({
  ideaId,
  mvpId,
  isNew,
  grapeEditor,
  isDirty,
  setIsDirty,
  metaTitle,
  metaDescription,
  handleImageUploads,
  cleanupOrphanedAssets,
  isSavingRef,
}: {
  ideaId: string | undefined;
  mvpId: string | null;
  isNew: boolean | null | undefined;
  grapeEditor: Editor | null;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  metaTitle: string;
  metaDescription: string;
  handleImageUploads: (assets: Assets) => Promise<AssetUrlMap>;
  cleanupOrphanedAssets: (html: string) => Promise<void>;
  isSavingRef: React.RefObject<boolean>;
}) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!ideaId && !mvpId) {
    throw new Error(
      "Idea ID and MVP ID are required for auto-save functionality"
    );
  }

  const handleSave = useCallback(
    async (isAutoSave = false) => {
      if (!ideaId || (!ideaId && !mvpId) || !grapeEditor || isSavingRef.current)
        return;

      isSavingRef.current = true;
      setSaveStatus("saving");
      if (!isAutoSave) {
        toast.loading("Saving...");
      }

      try {
        if (!grapeEditor.getHtml({ cleanId: true }).trim()) {
          toast.error("Please add some content before saving.");
          throw new Error("No content to save");
        }

        const uploadedAssetsRes = await handleImageUploads(
          grapeEditor.AssetManager.getAllVisible()
        );

        const bodyContent = grapeEditor.getHtml({ cleanId: true });
        const styles = grapeEditor.getCss({ avoidProtected: true });

        const validatedHtmlRes = getValidatedHtml(
          ideaId,
          mvpId,
          bodyContent,
          styles,
          metaTitle,
          metaDescription,
          CTA_BUTTON_ID
        );

        let { html } = validatedHtmlRes;

        if (!html || !validatedHtmlRes.isValid) {
          throw new Error(
            validatedHtmlRes.errorMessage ||
              "HTML validation failed. Please check your content."
          );
        }

        // Replace all base64 strings in the HTML with the new cloud URLs
        html = optimizeHtmlImages(html, uploadedAssetsRes);

        // Clean up orphaned assets
        await cleanupOrphanedAssets(html);

        if (isNew) {
          const name = `Variant ${new Date().toLocaleDateString()}`;

          const data = await createMVP(ideaId, name, html);
          if (data.error || !data.mvpId)
            throw new Error(data.error || "Save failed");

          setSaveStatus("success");
          setIsDirty(false);

          toast.dismiss();
          toast.success("Landing page created successfully!");
        } else {
          const data = await updateMVP(ideaId, mvpId, html);
          if (data.error) throw new Error(data.error || "Save failed");

          setSaveStatus("success");
          setIsDirty(false);

          if (!isAutoSave) {
            toast.dismiss();
            toast.success("Landing page saved successfully!");
          }
        }
      } catch (error) {
        const err = error as Error;
        if (err.message === "No content to save") {
          isSavingRef.current = false;
          setSaveStatus("idle");
          return;
        }

        setSaveStatus("error");
        if (!isAutoSave) {
          toast.dismiss();
        }

        toast.error(err.message || "Failed to save landing page.");
      } finally {
        isSavingRef.current = false;
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    },
    [
      ideaId,
      mvpId,
      isNew,
      grapeEditor,
      isSavingRef,
      handleImageUploads,
      metaTitle,
      metaDescription,
      cleanupOrphanedAssets,
      setIsDirty,
    ]
  );

  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (isNew || !isDirty || saveStatus !== "idle") {
      // If it's a new page, not dirty, or currently saving, don't auto-save
      return;
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave(true); // Call save with auto-save flag
    }, AUTOSAVE_DELAY);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [isNew, isDirty, saveStatus, handleSave]);

  return { handleSave: () => handleSave(false), saveStatus }; // Expose a manual save function
}
