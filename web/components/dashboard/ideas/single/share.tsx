"use client";

import { ReactNode } from "react";
import { toast } from "sonner";

import { Button, ButtonProps } from "@/components/ui/button";

type ShareIdeaUrlProps = ButtonProps & {
  ideaId: string;
  children?: ReactNode;
};

export const ShareIdeaUrl = ({
  ideaId,
  children = "Share",
  ...props
}: ShareIdeaUrlProps) => {
  const onClick = () => {
    const url = `${process.env.NEXT_PUBLIC_APP_URL}/mvp/${ideaId}`;
    navigator.clipboard.writeText(url);

    toast.success("Idea URL copied to clipboard!");
  };

  return (
    <Button onClick={onClick} {...props} aria-label="Share Idea URL">
      {children}
    </Button>
  );
};
