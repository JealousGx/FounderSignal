import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Textarea } from "@/components/ui/textarea";
import { getUsers } from "@/lib/auth";
import { getName } from "@/lib/utils";
import { Comment } from "@/types/comment";
import { auth, User } from "@clerk/nextjs/server";
import { CommentExtended, CommentItem } from "./comment";

export const CommentsSection = async ({
  comments,
}: {
  comments: Comment[];
}) => {
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

          {userId && (
            <Link
              href="#comment-form"
              variant="ghost"
              size="sm"
              className="text-primary font-medium"
            >
              Add comment
            </Link>
          )}
        </div>
      </div>

      {_comments?.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {_comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} userId={userId} />
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
      {userId && (
        <div className="p-4 md:p-6 bg-gray-50">
          <h3 className="text-md font-medium mb-4">Leave a comment</h3>

          <form className="space-y-4" id="comment-form">
            <Textarea
              className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
              placeholder="Share your thoughts on this idea..."
            ></Textarea>

            <div className="flex justify-end">
              <Button type="submit" className="flex justify-end w-max">
                Post comment
              </Button>
            </div>
          </form>
        </div>
      )}
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
