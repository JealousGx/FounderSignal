"use client";

import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { ReactionButtons } from "@/components/reactions-btns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CommentExtended } from "@/types/comment";
import { deleteComment } from "./actions";

type ReplyFormType = React.ComponentType<{
  ideaId: string;
  userId: string | null;
  commentId: string;
  onCancel: () => void;
  onReplyAdded: () => void;
  initialMention?: string;
}>;

type CommentActionsType = {
  ideaId: string;
  commentId: string;
};

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

                {userId && comment.author.id === userId && (
                  <CommentActions ideaId={ideaId} commentId={comment.id} />
                )}
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

const CommentActions = ({ commentId, ideaId }: CommentActionsType) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Button variant="ghost" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <DeleteComment ideaId={ideaId} commentId={commentId} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DeleteComment = ({
  ideaId,
  commentId,
}: {
  ideaId: string;
  commentId: string;
}) => {
  const handleDelete = async () => {
    const result = await deleteComment(ideaId, commentId);
    if (result.error) {
      console.error("Error deleting comment:", result.error);

      toast.error("Failed to delete comment. Please try again.");
    } else {
      toast.success("Comment deleted successfully!");
    }
  };

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete}>
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );
};
