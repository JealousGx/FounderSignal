import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Textarea } from "@/components/ui/textarea";
import { getUsers } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import { Comment } from "@/types/Comment";
import { auth } from "@clerk/nextjs/server";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";

type CommentExtended = Comment & {
  content: string;
  author: {
    name: string;
    image: string;
  };
};

export const CommentsSection = async ({
  comments,
}: {
  comments: Comment[];
}) => {
  const { userId } = await auth();

  const users = await getUsers(comments?.map((c) => c.userId) || []);

  const _comments = comments?.map((c) => {
    const user = users.find((user) => user.id === c.userId);

    return {
      ...c,
      content: c.comment,
      author: {
        name: user?.fullName || "Anonymous",
        image:
          user?.imageUrl || "https://randomuser.me/api/portraits/men/76.jpg",
      },
    } as CommentExtended;
  });

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
            <div key={comment.id} className="p-4 md:p-6">
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
                        {formatCommentDate(comment.createdAt)}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4">{comment.content}</p>

                  {userId && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`flex items-center gap-1 text-sm ${
                          comment.likedByUser
                            ? "text-primary font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />

                        <span>{comment.likes}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className={`${
                          comment.dislikedByUser
                            ? "text-red-500 font-medium"
                            : "text-gray-500"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />

                        <span>{comment.dislikes}</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Reply
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
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

function formatCommentDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return "Today";
  } else if (diffDays === 1) {
    return "Yesterday";
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return formatDate(dateString);
  }
}
