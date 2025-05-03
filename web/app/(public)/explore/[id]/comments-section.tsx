import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import Image from "next/image";

async function getCommentsForIdea(_ideaId: string) {
  // const res = await fetch(`http://localhost:8080/api/ideas/${ideaId}/comments`);
  // const data = await res.json();

  // Mock comments data
  return [
    {
      id: "comment-1",
      author: {
        name: "Daniel Chen",
        image: "https://randomuser.me/api/portraits/men/54.jpg",
      },
      content:
        "This is a brilliant concept that solves a real pain point. I've been looking for something like this for my own carbon footprint tracking.",
      createdAt: "2023-10-18T15:30:00Z",
      likes: 12,
      dislikes: 1,
      likedByUser: false,
      dislikedByUser: false,
    },
    {
      id: "comment-2",
      author: {
        name: "Sarah Williams",
        image: "https://randomuser.me/api/portraits/women/29.jpg",
      },
      content:
        "Have you considered adding integration with smart home devices to track energy consumption? That would be a killer feature for this app.",
      createdAt: "2023-10-19T09:45:00Z",
      likes: 8,
      dislikes: 0,
      likedByUser: true,
      dislikedByUser: false,
    },
    {
      id: "comment-3",
      author: {
        name: "Mark Thompson",
        image: "https://randomuser.me/api/portraits/men/76.jpg",
      },
      content:
        "I'm skeptical about the accuracy of automatic carbon tracking. Would this use AI to estimate or would it need integrations with every service?",
      createdAt: "2023-10-20T12:15:00Z",
      likes: 3,
      dislikes: 2,
      likedByUser: false,
      dislikedByUser: false,
    },
  ];
}

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

export const CommentsSection = async ({ ideaId }: { ideaId: string }) => {
  const comments = await getCommentsForIdea(ideaId);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-8">
      <div className="p-6 md:p-8 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Comments ({comments.length})</h2>
          <Link
            href="#comment-form"
            variant="ghost"
            size="sm"
            className="text-primary font-medium"
          >
            Add comment
          </Link>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {comments.map((comment) => (
          <div key={comment.id} className="p-6 md:p-8">
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
                <div className="flex items-center gap-4">
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Comment form */}
      <div className="p-6 md:p-8 bg-gray-50">
        <h3 className="text-md font-medium mb-4">Leave a comment</h3>

        <form className="space-y-4" id="comment-form">
          <Textarea
            className="w-full border border-gray-300 rounded-lg p-3 min-h-[100px]"
            placeholder="Share your thoughts on this idea..."
          ></Textarea>

          <div className="flex justify-end">
            <Button type="submit">Post comment</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
