"use client";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <>
          <Navbar />

          <div className="flex flex-col items-center justify-center h-screen text-center">
            <h1 className="text-4xl font-bold">Oops! Something went wrong.</h1>
            <p className="mt-4 text-lg">
              An unexpected error has occurred. Please try again later.
            </p>
            <Button onClick={reset} className="mt-6">
              Try again
            </Button>
          </div>
        </>
      </body>
    </html>
  );
}
