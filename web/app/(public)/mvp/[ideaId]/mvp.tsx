"use client";

import { useCallback, useEffect } from "react";

import { sendSignal } from "./action";

interface MVPProps {
  htmlContent: string;
  ideaId: string;
  mvpId?: string | null;
}

export const MVP = ({ htmlContent, ideaId, mvpId }: MVPProps) => {
  const handleSignal = useCallback(
    async (eventType: string, metadata?: { [key: string]: unknown }) => {
      try {
        await sendSignal(ideaId, mvpId, eventType, metadata);
      } catch (error) {
        console.error("Error sending signal:", error);
      }
    },
    [ideaId, mvpId]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Basic security: check origin if MVP is hosted on a different domain
      if (event.origin !== process.env.NEXT_PUBLIC_APP_URL) return;

      const {
        type,
        eventType,
        ideaId: msgIdeaId,
        mvpId: msgMvpId,
        metadata,
      } = event.data;

      if (type === "founderSignalTrack" && msgIdeaId === ideaId && eventType) {
        console.log("Received track event from MVP iframe:", {
          eventType,
          ideaId: msgIdeaId,
          mvpId: msgMvpId,
          metadata,
        });

        handleSignal(eventType, metadata);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [ideaId, handleSignal]);

  return (
    <iframe
      title="MVP Landing Page Preview"
      style={{ width: "100%", height: "100vh", border: "none" }}
      sandbox="allow-scripts allow-same-origin allow-modals"
      srcDoc={htmlContent} // Using srcDoc is an alternative to writing to iframe document
    />
  );
};
