"use client";

import { useEffect, useState } from "react";

import { CommentItem } from "@/components/comments/comment";
import { getComments } from "@/components/comments/get-comments";
import { Button } from "@/components/ui/button";
import { ReplyForm } from "./add-comment-form";

import { CommentExtended } from "@/types/comment";

export const CommentsSection = ({
  userId,
  ideaId,
  comments: initialComments,
  maxComments = 5,
  totalComments = 0,
}: {
  comments: CommentExtended[];
  userId: string;
  ideaId: string;
  maxComments?: number;
  totalComments?: number;
}) => {
  const [comments, setComments] = useState(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(totalComments > comments.length);

  useEffect(() => {
    setComments(initialComments);
    setHasMore(totalComments > initialComments.length);
  }, [initialComments, totalComments]);

  const handleLoadMore = async () => {
    setIsLoading(true);

    const lastComment = comments[comments.length - 1];
    try {
      const data = await getComments(ideaId, {
        limit: maxComments,
        lastCreatedAt: lastComment?.createdAt,
        lastId: lastComment?.id,
      });

      if (!data || !data.comments) return;

      const existingCommentIds = new Set(comments.map((c) => c.id));
      const newUniqueComments = data.comments.filter(
        (nc) => !existingCommentIds.has(nc.id)
      );

      if (newUniqueComments.length > 0) {
        setComments((prev) => [...prev, ...newUniqueComments]);
      }

      setHasMore(data.total > data.comments.length + comments.length);
    } catch (error) {
      console.error("Failed to load more comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          userId={userId}
          ideaId={ideaId}
          ReplyForm={ReplyForm}
        />
      ))}

      {hasMore && (
        <div className="text-center mt-4">
          <Button onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};
