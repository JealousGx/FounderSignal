"use client";

import { Info, Save, Settings } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import DOMPurify from "dompurify";
import grapesjs, { Asset, Assets, Editor } from "grapesjs";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import grapesjsPresetWebpage from "grapesjs-preset-webpage";
import "grapesjs/dist/css/grapes.min.css";
import "grapesjs/dist/grapes.min.js";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { uploadImageWithSignedUrl } from "@/components/shared/image-upload/actions";
import { getMVP } from "../action";
import { updateMVP } from "./action";

export default function EditLandingPage() {
  const params = useParams();
  const ideaId = Array.isArray(params.ideaId)
    ? params.ideaId[0]
    : params.ideaId;

  const [saving, setSaving] = useState(false);
  const [grapeEditor, setGrapeEditor] = useState<Editor | null>(null);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const editorRef = useRef<HTMLDivElement>(null);

  // GrapeJS init
  useEffect(() => {
    if (!editorRef.current) return;

    const editor = grapesjs.init({
      container: editorRef.current,
      fromElement: true,
      height: "100vh",
      width: "100%",
      storageManager: false,
      assetManager: {},
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

          // Parse meta title/description from loaded HTML
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
          } catch {}
        }
      });
    }
  }, [ideaId, grapeEditor]);

  const handleAssets = async (assets: Assets) => {
    if (!ideaId || !grapeEditor) return;

    const models = assets.models;

    const assetsToUpload = models.filter((m: Asset) =>
      (m.id as string).startsWith("data:image")
    ) as Asset[];

    if (!assetsToUpload || assetsToUpload.length === 0) return;

    console.log("Found assets to upload:", assetsToUpload.length);

    const uploadPromises = assetsToUpload.map(async (asset) => {
      const dataUrl = asset.id as string;
      const fileName = getImageFileName(ideaId, asset.attributes.name);

      // Extract content type and base64 data from data URL
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error("Invalid data URL format");
      }

      const contentType = matches[1];
      const base64String = matches[2];

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

      // Test if the image is accessible
      try {
        const testResponse = await fetch(uploadResponse.imageUrl, {
          method: "HEAD",
        });
        console.log(
          "Image accessibility test:",
          testResponse.ok ? "SUCCESS" : "FAILED",
          testResponse.status
        );
      } catch (error) {
        console.error("Image accessibility test failed:", error);
      }

      return { base64String: dataUrl, cloudUrl: uploadResponse.imageUrl };
    });

    const uploadedAssets = await Promise.all(uploadPromises);
    const urlMap = new Map(
      uploadedAssets.map((a) => [a.base64String, a.cloudUrl])
    );

    console.log("URL mapping:", Array.from(urlMap.entries()));

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
  };

  async function handleSave() {
    if (!ideaId || !grapeEditor) return;

    const uploadedAssetsRes = await handleAssets(
      grapeEditor.AssetManager.getAllVisible()
    );
    const bodyContent = grapeEditor.getHtml({ cleanId: true });

    if (!bodyContent.trim()) {
      toast.error("Please add some content before saving.");
      return;
    }

    const validatedHtmlRes = getValidatedHtml(
      ideaId,
      bodyContent,
      metaTitle,
      metaDescription
    );

    const { shouldBreak, errorMessage } = validatedHtmlRes;
    let html = validatedHtmlRes.html;

    if (!html || shouldBreak) {
      toast.error(errorMessage || "Invalid HTML content. Please fix errors.", {
        duration: 5000,
      });

      return;
    }

    // Replace all base64 strings in the HTML with the new cloud URLs
    uploadedAssetsRes?.forEach((cloudUrl, base64Src) => {
      const escapedSrc = base64Src.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const beforeCount = (html!.match(new RegExp(escapedSrc, "g")) || [])
        .length;
      html = html!.replace(new RegExp(escapedSrc, "g"), cloudUrl);
      const afterCount = (html!.match(new RegExp(cloudUrl, "g")) || []).length;
      console.log(
        `Replaced ${beforeCount} occurrences of base64 with ${afterCount} cloud URLs`
      );
    });

    setSaving(true);

    try {
      const data = await updateMVP(ideaId, html);
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

      <div
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
        onMouseEnter={() => setIsMenuOpen(true)}
        onMouseLeave={() => setIsMenuOpen(false)}
      >
        <div
          className={`flex bg-background/50 backdrop-blur-sm p-2 rounded-full items-center gap-2 transition-all duration-300 ${
            isMenuOpen
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 translate-x-4 pointer-events-none"
          }`}
        >
          {/* Save Button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleSave}
                disabled={saving}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white rounded-full w-10 h-10 p-0 shadow-lg"
              >
                <Save className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save Landing Page</p>
            </TooltipContent>
          </Tooltip>

          {/* Meta Settings Modal Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="bg-background hover:bg-accent text-foreground rounded-full w-10 h-10 p-0 shadow-lg border"
                onClick={() => setIsModalOpen(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Page Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Pencil Icon Trigger */}
        <div className="cursor-pointer">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 p-0 shadow-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Page Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Meta Settings Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Page Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-7 mt-4">
            <div className="flex flex-col gap-4">
              <div>
                <Label
                  className="flex gap-2 items-center text-sm font-medium mb-1"
                  htmlFor="meta-title"
                >
                  Page Title
                  <CustomTooltip text="This is the title of your page, which appears in the browser tab and is important for SEO." />
                </Label>
                <Input
                  id="meta-title"
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Enter page title (for SEO and browser tab)"
                  maxLength={60}
                />
              </div>

              <div>
                <Label
                  className="flex gap-2 items-center text-sm font-medium mb-1"
                  htmlFor="meta-description"
                >
                  Meta Description
                  <CustomTooltip text="This is the meta description for your page, which appears in search results and social media previews." />
                </Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Enter meta description (for SEO and social sharing)"
                  maxLength={160}
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setIsModalOpen(false)}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const CustomTooltip = ({ text }: { text: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="text-muted-foreground w-4 h-4" />
      </TooltipTrigger>
      <TooltipContent
        className="bg-accent-foreground"
        arrowClasses="bg-accent-foreground fill-accent-foreground"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

function getValidatedHtml(
  ideaId: string,
  bodyContent: string,
  metaTitle: string,
  metaDescription: string
) {
  let _shouldBreak = false;
  let errorMessage = "";

  // Manually construct the complete HTML document
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metaTitle}</title>
    <meta name="description" content="${metaDescription}">
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
    ${bodyContent}
    ${getTrackingScript(ideaId)}
</body>
</html>`;

  // Validate CTA button exists
  try {
    const parser = new DOMParser();
    const docObj = parser.parseFromString(html, "text/html");

    docObj.querySelectorAll('[id="ctaButton"]').forEach((el) => {
      if (el.tagName.toLowerCase() !== "button") {
        el.removeAttribute("id");
        _shouldBreak = true;
        errorMessage =
          "You've added an id to a non-button element. Please remove the id from the element and add a button instead.";
      }
    });

    // Check if at least one <button id="ctaButton"> exists
    const ctaButton = docObj.querySelector("button#ctaButton");
    if (!ctaButton) {
      _shouldBreak = true;
      errorMessage =
        "You must have at least one <button> with id='ctaButton' for tracking to work. Please add a CTA button.";
    }
  } catch (error) {
    console.error("Error validating HTML:", error);
  }

  if (_shouldBreak) {
    return { shouldBreak: _shouldBreak, errorMessage };
  }

  // Sanitize with comprehensive landing page support
  const cleanHtml = DOMPurify.sanitize(html, {
    WHOLE_DOCUMENT: true,
    // Allow all standard HTML elements for landing pages
    ADD_TAGS: [
      // Document structure
      "html",
      "head",
      "body",
      "title",
      "meta",
      "link",
      "style",
      "script",
      // Content sections
      "header",
      "main",
      "section",
      "article",
      "aside",
      "footer",
      "nav",
      // Text content
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "span",
      "div",
      "strong",
      "em",
      "small",
      "mark",
      "del",
      "ins",
      "sub",
      "sup",
      "blockquote",
      "cite",
      "q",
      "abbr",
      "address",
      "time",
      // Lists
      "ul",
      "ol",
      "li",
      "dl",
      "dt",
      "dd",
      // Tables
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
      "th",
      "td",
      "caption",
      "colgroup",
      "col",
      // Forms
      "form",
      "input",
      "textarea",
      "select",
      "option",
      "optgroup",
      "button",
      "label",
      "fieldset",
      "legend",
      "datalist",
      "output",
      // Media
      "img",
      "picture",
      "source",
      "figure",
      "figcaption",
      "video",
      "audio",
      "track",
      "embed",
      "object",
      "param",
      "iframe",
      "canvas",
      "svg",
      "math",
      // Interactive
      "details",
      "summary",
      "dialog",
      // Generic
      "br",
      "hr",
      "wbr",
      "pre",
      "code",
      "kbd",
      "samp",
      "var",
    ],
    // Allow comprehensive attributes for modern landing pages
    ADD_ATTR: [
      // Global attributes
      "id",
      "class",
      "style",
      "title",
      "lang",
      "dir",
      "tabindex",
      "accesskey",
      "contenteditable",
      "draggable",
      "hidden",
      "spellcheck",
      "translate",
      "role",
      "aria-*",
      "data-*",
      // Meta and linking
      "charset",
      "name",
      "content",
      "http-equiv",
      "property",
      "href",
      "rel",
      "type",
      "media",
      "sizes",
      "integrity",
      "crossorigin",
      // Media attributes
      "src",
      "alt",
      "width",
      "height",
      "loading",
      "decoding",
      "srcset",
      "sizes",
      "poster",
      "preload",
      "autoplay",
      "controls",
      "loop",
      "muted",
      "playsinline",
      // Form attributes
      "action",
      "method",
      "enctype",
      "target",
      "autocomplete",
      "novalidate",
      "value",
      "placeholder",
      "required",
      "readonly",
      "disabled",
      "checked",
      "selected",
      "multiple",
      "size",
      "maxlength",
      "minlength",
      "max",
      "min",
      "step",
      "pattern",
      "accept",
      "capture",
      // Table attributes
      "colspan",
      "rowspan",
      "headers",
      "scope",
      // Interactive attributes
      "open",
      "controls",
      "defer",
      "async",
      // Frame attributes
      "frameborder",
      "allowfullscreen",
      "allowpaymentrequest",
      "sandbox",
      "srcdoc",
      "allow",
      // Styling and layout
      "align",
      "valign",
      "bgcolor",
      "border",
      "cellpadding",
      "cellspacing",
      // Event handlers (commonly used in landing pages)
      "onclick",
      "onsubmit",
      "onload",
      "onerror",
      "onchange",
      "oninput",
      "onfocus",
      "onblur",
      "onmouseover",
      "onmouseout",
      "onkeydown",
      "onkeyup",
    ],
    // Keep comments for debugging
    KEEP_CONTENT: true,
    // Allow data URIs for inline images
    ALLOW_DATA_ATTR: true,
    // Allow unknown protocols (for custom schemes)
    ALLOW_UNKNOWN_PROTOCOLS: false,
    // Custom URL schemes commonly used in landing pages
    ALLOWED_URI_REGEXP:
      /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|xxx|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });

  return { html: cleanHtml, shouldBreak: false, errorMessage: "" };
}

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

const getImageFileName = (ideaId: string, imageName: string) => {
  return `${ideaId}/${imageName}`;
};
