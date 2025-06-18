"use client";

import { type VariantProps } from "class-variance-authority";
import React, { ReactNode } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

type ShareIdeaUrlProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
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
    <Button onClick={onClick} {...props}>
      {children}
    </Button>
  );
};
