"use client";

import { Brain, Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import { toast } from "sonner";
import { generateRedditValidation } from "./actions";

interface GenerateRedditValidationButtonProps {
  ideaId: string;
  onSuccess?: (validationId: string) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function GenerateRedditValidationButton({
  ideaId,
  onSuccess,
  variant = "default",
  size = "default",
  className,
}: GenerateRedditValidationButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const { validationId } = await generateRedditValidation(ideaId);

      toast("Validation Started", {
        description:
          "Your Reddit analysis is being processed. This may take a few minutes.",
      });
      onSuccess?.(validationId);
    } catch (error) {
      console.error("Failed to generate Reddit validation:", error);

      toast.error("Error", {
        description: "Failed to start validation. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Brain className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Generating..." : "Generate Reddit Analysis"}
    </Button>
  );
}
