import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getComments } from "@/components/comments/get-comments";
import { auth } from "@clerk/nextjs/server";
import { AddCommentForm } from "./add-comment-form";
import { CommentsSection } from "./comments";

interface FeedbackSectionProps {
  ideaId: string;
}

const MAX_COMMENTS = 3;

export default async function FeedbackSection({
  ideaId,
}: FeedbackSectionProps) {
  const { userId } = await auth();

  if (!userId) return null;

  const data = await getComments(ideaId, { limit: MAX_COMMENTS });
  const comments = data?.comments || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Comments</CardTitle>
        <CardDescription>
          Comments and suggestions from early supporters
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AddCommentForm ideaId={ideaId} userId={userId} />

        {comments && comments.length > 0 ? (
          <CommentsSection
            userId={userId}
            ideaId={ideaId}
            comments={comments}
            maxComments={MAX_COMMENTS}
            totalComments={data?.total}
          />
        ) : (
          <div className="text-center text-sm text-muted-foreground p-4 md:p-6">
            No comments yet. Share your idea with the world and wait for them to
            come!
          </div>
        )}
      </CardContent>
    </Card>
  );
}
