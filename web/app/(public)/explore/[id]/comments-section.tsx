import { auth, User } from "@clerk/nextjs/server";

import { AddCommentButton } from "./add-comment-button";
import { AddCommentForm } from "./add-comment-form";
import { CommentExtended, CommentItem } from "./comment";

import { api } from "@/lib/api";
import { getUsers } from "@/lib/auth";
import { getName } from "@/lib/utils";
import { Comment } from "@/types/comment";

const getComments = async (ideaId: string) => {
  try {
    const response = await api.get(`/ideas/${ideaId}/feedback`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`comments-${ideaId}`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching comments:",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();
    return (data.comments || []) as Comment[];
  } catch (error) {
    console.error("Error in getComments:", error);
    return null;
  }
};

export const CommentsSection = async ({ ideaId }: { ideaId: string }) => {
  const comments = await getComments(ideaId);
  const { userId } = await auth();

  const allUserIds = getAllUserIds(comments || []);
  const users = await getUsers(allUserIds);

  const _comments = mapComments(comments || [], users);

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

      {_comments?.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {_comments.map((comment) => (
            <CommentItem
              key={comment.id}
              ideaId={ideaId}
              comment={comment}
              userId={userId}
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

const getAllUserIds = (commentList: Comment[]): string[] => {
  let ids: string[] = [];
  commentList.forEach((comment) => {
    ids.push(comment.userId);
    if (comment.replies && comment.replies.length > 0) {
      ids = ids.concat(getAllUserIds(comment.replies));
    }
  });
  return ids;
};

const mapComments = (
  commentList: Comment[],
  users: User[]
): CommentExtended[] => {
  return commentList?.map((c) => {
    const user = users.find((user) => user.id === c.userId);

    return {
      ...c,
      content: c.comment,
      author: {
        name: user ? getName(user) : "Unknown User",
        image:
          user?.imageUrl || "https://randomuser.me/api/portraits/men/76.jpg",
      },
      replies: c.replies
        ? mapComments(c.replies, users)
        : ([] as CommentExtended[]),
    };
  });
};
