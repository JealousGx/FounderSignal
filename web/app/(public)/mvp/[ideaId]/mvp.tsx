"use client";

import { useEffect } from "react";

interface MVPProps {
  htmlContent: string;
}

export const MVP = ({ htmlContent }: MVPProps) => {
  useEffect(() => {
    if (htmlContent) {
      document.documentElement.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  // Return null or a placeholder as the content is replaced
  return null;
};
