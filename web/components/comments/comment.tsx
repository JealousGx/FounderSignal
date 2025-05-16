"use client";

import { formatDistanceToNow } from "date-fns";
import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { ReactionButtons } from "@/components/reactions-btns";
import { Button } from "@/components/ui/button";

import { CommentExtended } from "@/types/comment";

type ReplyFormType = React.ComponentType<{
  ideaId: string;
  userId: string | null;
  commentId: string;
  onCancel: () => void;
  onReplyAdded: () => void;
  initialMention?: string;
}>;

export const CommentItem = ({
  ideaId,
  comment,
  userId,
  ReplyForm,
}: {
  comment: CommentExtended;
  userId: string | null;
  ideaId: string;
  ReplyForm: ReplyFormType;
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  const handleReplyClick = () => {
    setShowReplyForm(true);
  };

  const handleReplyCancel = () => {
    setShowReplyForm(false);
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={comment.author.image}
            alt={comment.author.name}
            width={40}
            height={40}
            className="object-cover"
          />
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h4 className="font-medium">{comment.author.name}</h4>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
          </div>

          <p className="text-gray-700 mb-4">{comment.content}</p>

          {userId && (
            <div className="w-full flex items-center gap-1 flex-col">
              <div className="flex items-center gap-1 flex-start w-full">
                <ReactionButtons
                  ideaId={ideaId}
                  commentId={comment.id}
                  likedByUser={comment.likedByUser}
                  dislikedByUser={comment.dislikedByUser}
                  likes={comment.likes}
                  dislikes={comment.dislikes}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={handleReplyClick}
                >
                  Reply
                </Button>
              </div>

              {showReplyForm && userId && (
                <ReplyForm
                  ideaId={ideaId}
                  userId={userId}
                  commentId={comment.id}
                  onCancel={handleReplyCancel}
                  onReplyAdded={handleReplyAdded}
                  initialMention={`@${comment.author.name} `}
                />
              )}
            </div>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <CollapsibleReplies
              ideaId={ideaId}
              replies={comment.replies}
              userId={userId}
              ReplyForm={ReplyForm}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const CollapsibleReplies = ({
  replies,
  userId,
  ideaId,
  ReplyForm,
}: {
  replies: CommentExtended[];
  userId: string | null;
  ideaId: string;
  ReplyForm: ReplyFormType;
}) => {
  const [expanded, setExpanded] = useState(false);

  const visibleReplies = expanded ? replies : replies.slice(0, 1);
  const hiddenRepliesCount = replies.length - 1;

  return (
    <div className="mt-4 pl-4 border-l border-gray-200">
      {visibleReplies.map((reply) => (
        <CommentItem
          key={reply.id}
          ideaId={ideaId}
          comment={reply}
          userId={userId}
          ReplyForm={ReplyForm}
        />
      ))}

      {replies.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-primary flex items-center gap-1 text-sm"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" /> Hide replies
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" /> Show {hiddenRepliesCount} more{" "}
              {hiddenRepliesCount === 1 ? "reply" : "replies"}
            </>
          )}
        </Button>
      )}
    </div>
  );
};
