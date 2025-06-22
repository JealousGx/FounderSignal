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

    setGrapeEditor(editor);

    return () => {
      editor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorRef, isSavingRef, setDirty]);

  return grapeEditor;
}
