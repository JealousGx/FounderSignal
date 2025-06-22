"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import "grapesjs/dist/css/grapes.min.css";
import "grapesjs/dist/grapes.min.js";

import { getMVP } from "../action";
import { FloatingActionMenu } from "./floating-menu";
import { extractFileNameFromUrl } from "./hooks/helpers";
import { MetaSettingsModal } from "./meta-settings";

import { useAssets } from "./hooks/use-assets";
import { useAutoSave } from "./hooks/use-auto-save";
import { useGrapesEditor } from "./hooks/use-grapes-editor";
import { useUnsavedChanges } from "./hooks/use-unsaved-changes";

export default function EditLandingPage() {
  const params = useParams();
  const ideaId = Array.isArray(params.ideaId)
    ? params.ideaId[0]
    : params.ideaId;

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isDirty, setIsDirty, setDirty] = useUnsavedChanges();
  const isSavingRef = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const grapeEditor = useGrapesEditor(editorRef, isSavingRef, setDirty);
  const { setCurrentAssets, handleImageUploads, cleanupOrphanedAssets } =
    useAssets(ideaId, grapeEditor);

  const { handleSave, saveStatus } = useAutoSave({
    ideaId,
    grapeEditor,
    isDirty,
    setIsDirty,
    metaTitle,
    metaDescription,
    handleImageUploads,
    cleanupOrphanedAssets,
    isSavingRef,
  });

  useEffect(() => {
    if (ideaId && grapeEditor) {
      getMVP(ideaId).then((data) => {
        if (data.htmlContent) {
          try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data.htmlContent, "text/html");

            const title = doc.querySelector("title")?.textContent || "";
            const desc =
              doc
                .querySelector('meta[name="description"]')
                ?.getAttribute("content") || "";

            setMetaTitle(title);
            setMetaDescription(desc);

            const styleTag = doc.head.querySelector("style");
            if (styleTag) {
              grapeEditor.setStyle(styleTag.innerHTML);
            }

            // remove any script / link tags from the body.
            // only set the body content
            doc.body
              .querySelectorAll("script, link")
              .forEach((el) => el.remove());
            const bodyContent = doc.body.innerHTML;
            grapeEditor.setComponents(bodyContent);

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
            setIsDirty(false);
          } catch (error) {
            console.error("Failed to parse existing HTML:", error);
            toast.error("Could not load existing page content.");
          }
        }
      });
    }
  }, [ideaId, grapeEditor, setCurrentAssets, setIsDirty]);

  const handleMetaTitleChange = (newTitle: string) => {
    setMetaTitle(newTitle);
    setIsDirty(true);
  };

  const handleMetaDescriptionChange = (newDescription: string) => {
    setMetaDescription(newDescription);
    setIsDirty(true);
  };

  return (
    <div className="relative w-full h-screen">
      <style jsx global>{`
        /* Smooth transitions for images in GrapeJS editor */
        .gjs-frame img {
          transition: opacity 0.3s ease-in-out;
        }

        .image-transition {
          transition: opacity 0.3s ease-in-out !important;
        }

        /* Prevent layout shift during image loading */
        .gjs-frame img[src*="data:image"] {
          opacity: 0.8;
        }

        .gjs-frame img[src*="data:image"]:not([src*="data:image/svg+xml"]) {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
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
        isSaving={saveStatus === "saving"}
        saveStatus={saveStatus}
      />

      <MetaSettingsModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        metaTitle={metaTitle}
        setMetaTitle={handleMetaTitleChange}
        metaDescription={metaDescription}
        setMetaDescription={handleMetaDescriptionChange}
      />
    </div>
  );
}
