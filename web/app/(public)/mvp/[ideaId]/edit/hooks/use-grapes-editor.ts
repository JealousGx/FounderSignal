import grapesjs, { Editor } from "grapesjs";
import grapesjsBlocksBasic from "grapesjs-blocks-basic";
import grapesjsPresetWebpage from "grapesjs-preset-webpage";
import { RefObject, useEffect, useState } from "react";

export function useGrapesEditor(
  editorRef: RefObject<HTMLDivElement | null>,
  isSavingRef: React.RefObject<boolean>,
  setDirty: () => void
) {
  const [grapeEditor, setGrapeEditor] = useState<Editor | null>(null);

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

    const onContentChange = () => {
      if (!isSavingRef.current) {
        setDirty();
      }
    };

    editor.on("component:update", onContentChange);
    editor.on("asset:add", onContentChange);
    editor.on("asset:remove", onContentChange);
    editor.on("change", onContentChange);

    console.log("GrapesJS editor initialized");
    setGrapeEditor(editor);

    return () => {
      console.log("Cleaning up GrapesJS editor...");

      editor.off("component:update", onContentChange);
      editor.off("asset:add", onContentChange);
      editor.off("asset:remove", onContentChange);
      editor.off("change", onContentChange);

      editor.destroy();
      setGrapeEditor(null);
    };

    // Note: `isSavingRef` is excluded from the dependency array because it is a mutable ref object, and changes to `.current` do not trigger re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef, setDirty]);

  return grapeEditor;
}
