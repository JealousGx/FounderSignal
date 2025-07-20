"use client";

import dynamic from "next/dynamic";

const GrapesEditor = dynamic(
  () => import("./editor-page").then((mod) => mod.EditLandingPage),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>,
  }
);

export { GrapesEditor as EditorWrapper };
