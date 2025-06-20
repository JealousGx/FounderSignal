"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import DOMPurify from "dompurify";
import grapesjs, { Editor } from "grapesjs";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import grapesjsPresetWebpage from "grapesjs-preset-webpage";
import "grapesjs/dist/css/grapes.min.css";
import "grapesjs/dist/grapes.min.js";

import { Button } from "@/components/ui/button";
import { getMVP } from "../action";
import { updateMVP } from "./action";

const getTrackingScript = (ideaId: string) => `<script>(function() {
            const ideaId = "${ideaId}";
            const postTrackEvent = (eventType, metadata) => {
                if (window.parent && window.parent.postMessage) {
                    window.parent.postMessage({ type: 'founderSignalTrack', eventType: eventType, ideaId: ideaId, metadata: metadata }, '*');
                }
            };

            // 1. Track Page View
            postTrackEvent('pageview', { path: window.location.pathname, title: document.title });

            // 2. Track CTA Click
            const ctaButton = document.getElementById('ctaButton');
            if (ctaButton) {
                ctaButton.addEventListener('click', function() {
                    postTrackEvent('cta_click', { buttonText: ctaButton.innerText, ctaElementId: ctaButton.id });
                    alert('Thanks for your interest!'); // Optional: client-side feedback
                });
            }

            // 3. Track Scroll Depth
            let scrollReached = { 25: false, 50: false, 75: false, 100: false };
            let scrollTimeout;
            function handleScroll() {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    const docElem = document.documentElement;
                    const scrollHeight = docElem.scrollHeight - docElem.clientHeight;
                    if (scrollHeight === 0) { // Content not scrollable or fully visible
                        if (!scrollReached[100]) {
                            postTrackEvent('scroll_depth', { percentage: 100 });
                            scrollReached[100] = true;
                        }
                        return;
                    }
                    const scrollTop = window.pageYOffset || docElem.scrollTop;
                    const currentPercentage = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

                    [25, 50, 75, 100].forEach(depth => {
                        if (currentPercentage >= depth && !scrollReached[depth]) {
                            postTrackEvent('scroll_depth', { percentage: depth });
                            scrollReached[depth] = true;
                        }
                    });
                }, 150); // Debounce scroll events
            }
            // Initial check in case content is not scrollable but covers depths
            handleScroll(); 
            window.addEventListener('scroll', handleScroll, { passive: true });

            // 4. Track Time on Page
            const startTime = Date.now();
            const sendTimeOnPage = () => {
                const durationSeconds = Math.round((Date.now() - startTime) / 1000);
                postTrackEvent('time_on_page', { duration_seconds: durationSeconds });
            };
            
            // More reliable way to send data on page unload
            window.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    sendTimeOnPage();
                }
            });
            // As a fallback, though 'pagehide' or 'beforeunload' can be unreliable for async.
            // The postMessage should be synchronous enough.
            window.addEventListener('pagehide', sendTimeOnPage);

        })();
    </script>`;

export default function EditLandingPage() {
  const params = useParams();
  const ideaId = Array.isArray(params.ideaId)
    ? params.ideaId[0]
    : params.ideaId;
  const [saving, setSaving] = useState(false);
  const [grapeEditor, setGrapeEditor] = useState<Editor | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // GrapeJS init
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: true,
      height: "calc(100vh - 150px)",
      width: "100%",
      storageManager: false,
      plugins: [grapesjsBlocksBasic, grapesjsPresetWebpage],
      pluginsOpts: {
        "grapesjs-preset-webpage": {},
      },
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
  }, []);

  useEffect(() => {
    if (ideaId && grapeEditor) {
      getMVP(ideaId).then((data) => {
        if (data.htmlContent) {
          grapeEditor.setComponents(data.htmlContent);
        }
      });
    }
  }, [ideaId, grapeEditor]);

  async function handleSave() {
    if (!ideaId || !grapeEditor) return;

    const doc = grapeEditor.Canvas.getDocument();

    if (!doc) {
      toast.error("Please add some content before saving.");
      return;
    }

    let html = `<!DOCTYPE html>${doc.documentElement.outerHTML}`;

    // Inject tracking script if not present
    if (!html.includes("founderSignalTrack")) {
      html = html.replace("</body>", `${getTrackingScript(ideaId)}</body>`);
    }

    // Sanitize
    const cleanHtml = DOMPurify.sanitize(html, {
      WHOLE_DOCUMENT: true,
      ADD_TAGS: ["script", "style", "iframe", "link"],
      ADD_ATTR: [
        "style",
        "id",
        "class",
        "src",
        "frameborder",
        "allowfullscreen",
      ],
    });

    setSaving(true);

    try {
      const data = await updateMVP(ideaId, cleanHtml);
      if (data.error) throw new Error(data.error || "Save failed");

      toast.success("Landing page saved!");
    } catch (e: unknown) {
      const err = e as Error;
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-background flex flex-col items-center">
      <div className="w-full flex items-center justify-between max-w-7xl p-6">
        <h1 className="text-3xl font-bold mb-2 text-primary">
          Edit Your Landing Page
        </h1>

        <Button onClick={handleSave} disabled={saving} className="ml-auto">
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>

      <div ref={editorRef}>
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
    </main>
  );
}
