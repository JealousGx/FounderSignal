import { auth } from "@clerk/nextjs/server";

import { AddCommentButton } from "./add-comment-button";
import { AddCommentForm, ReplyForm } from "./add-comment-form";

import { CommentItem } from "@/components/comments/comment";
import { getComments } from "@/components/comments/get-comments";

export const CommentsSection = async ({ ideaId }: { ideaId: string }) => {
  const data = await getComments(ideaId);
  const comments = data?.comments || [];
  const { userId } = await auth();

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="p-4 md:p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">
            Comments ({comments?.length || 0})
          </h2>

          {userId && <AddCommentButton />}
        </div>
      </div>

      {comments && comments.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              ideaId={ideaId}
              comment={comment}
              userId={userId}
              ReplyForm={ReplyForm}
            />
          ))}
        </div>
      ) : (
        <div className="p-4 md:p-6 text-center">
          <p className="text-gray-500">
            No comments yet. Be the first to comment!
          </p>
        </div>
      )}

      {/* Comment form */}
      {userId && <AddCommentForm ideaId={ideaId} userId={userId} />}
    </div>
  );
};
