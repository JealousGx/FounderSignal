"use client";

import { useEffect, useRef } from "react";
import { sendSignal } from "./action";

interface MVPProps {
  htmlContent: string;
  ideaId: string;
}

export const MVP = ({ htmlContent, ideaId }: MVPProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef?.current && htmlContent) {
      const doc =
        iframeRef.current.contentDocument ||
        iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.writeln(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check origin if MVP is hosted on a different domain
      if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

      const {
        type,
        eventType,
        ideaId: msgIdeaId,
        mvpId,
        metadata,
      } = event.data;

      if (type === "founderSignalTrack" && msgIdeaId === ideaId && eventType) {
        console.log("Received track event from MVP iframe:", {
          eventType,
          ideaId,
          mvpId,
          metadata,
        });
        sendSignal(ideaId, mvpId, eventType, metadata);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [ideaId]);

  return (
    <iframe
      ref={iframeRef}
      title="MVP Landing Page Preview"
      style={{ width: "100%", height: "100vh", border: "none" }}
      sandbox="allow-scripts allow-same-origin allow-modals"
      srcDoc={htmlContent} // Using srcDoc is an alternative to writing to iframe document
    />
  );
};
