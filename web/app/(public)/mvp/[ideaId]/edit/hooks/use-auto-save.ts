import { Assets, Editor } from "grapesjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { updateMVP } from "./actions";
import { optimizeHtmlImages } from "./helpers";
import { AssetUrlMap } from "./use-assets";
import { getValidatedHtml } from "./validation";

const CTA_BUTTON_ID = "ctaButton";
const AUTOSAVE_DELAY = 2 * 60 * 1000; // 2 minutes

export type SaveStatus = "idle" | "saving" | "success" | "error";

export function useAutoSave({
  ideaId,
  mvpId,
  grapeEditor,
  isDirty,
  setIsDirty,
  mvpName,
  metaTitle,
  metaDescription,
  handleImageUploads,
  cleanupOrphanedAssets,
  isSavingRef,
  assetUrlMapRef,
}: {
  ideaId: string | undefined;
  mvpId: string | null;
  grapeEditor: Editor | null;
  isDirty: boolean;
  setIsDirty: React.Dispatch<React.SetStateAction<boolean>>;
  mvpName: string;
  metaTitle: string;
  metaDescription: string;
  handleImageUploads: (assets: Assets) => Promise<AssetUrlMap>;
  cleanupOrphanedAssets: (html: string) => Promise<void>;
  isSavingRef: React.RefObject<boolean>;
  assetUrlMapRef: React.RefObject<AssetUrlMap>;
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

        await handleImageUploads(grapeEditor.AssetManager.getAllVisible());

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
        html = optimizeHtmlImages(html, assetUrlMapRef.current);

        // Clean up orphaned assets
        await cleanupOrphanedAssets(html);

        const data = await updateMVP(ideaId, mvpId, html, mvpName);
        if (data.error) throw new Error(data.error || "Save failed");

        setSaveStatus("success");
        setIsDirty(false);

        if (!isAutoSave) {
          toast.dismiss();
          toast.success("Landing page saved successfully!", {
            duration: 3000,
          });
        }
      } catch (error) {
        const err = error as Error;
        if (err.message === "No content to save") {
          isSavingRef.current = false;
          setSaveStatus("idle");
          return;
        }

        setSaveStatus("error");

        toast.error(err.message || "Failed to save landing page.", {
          duration: 5000,
        });
      } finally {
        isSavingRef.current = false;
        setTimeout(() => setSaveStatus("idle"), 2000);
      }
    },
    [
      ideaId,
      mvpId,
      mvpName,
      grapeEditor,
      isSavingRef,
      handleImageUploads,
      metaTitle,
      metaDescription,
      cleanupOrphanedAssets,
      setIsDirty,
      assetUrlMapRef,
    ]
  );

  // Auto-save effect
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    if (!isDirty || saveStatus !== "idle") {
      // If it's not dirty, or currently saving, don't auto-save
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
  }, [isDirty, saveStatus, handleSave]);

  return { handleSave: () => handleSave(false), saveStatus }; // Expose a manual save function
}
