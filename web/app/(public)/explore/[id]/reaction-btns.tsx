"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { submitReaction } from "./action";

interface Props {
  likedByUser: boolean;
  dislikedByUser: boolean;
  likes: number;
  dislikes: number;
  ideaId: string;
  commentId?: string;
}

export const ReactionButtons = ({
  ideaId,
  commentId,
  likedByUser,
  dislikedByUser,
  likes,
  dislikes,
}: Props) => {
  const onReact = async (reaction: "like" | "dislike" | "remove") => {
    await submitReaction(ideaId, reaction, commentId).then((res) => {
      if (res.error) {
        console.error("Error submitting reaction:", res.error);
        toast.error("Error submitting reaction. Please try again later.");
      }
    });
  };

  return (
    <>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onReact(likedByUser ? "remove" : "like")}
      >
        <ThumbsUp
          className={`w-4 h-4 ${
            likedByUser ? "text-primary font-medium" : "text-gray-500"
          }`}
        />
        <span>{likes}</span>
      </Button>

      <Button
        size="sm"
        variant="ghost"
        className="inline-flex items-center gap-2"
        onClick={() => onReact(dislikedByUser ? "remove" : "dislike")}
      >
        <ThumbsDown
          className={`w-4 h-4 ${
            dislikedByUser ? "text-red-500" : "text-gray-500"
          }`}
        />
        <span>{dislikes}</span>
      </Button>
    </>
  );
};
