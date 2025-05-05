import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, Reply } from "lucide-react";

interface FeedbackSectionProps {
  ideaId: string;
}

export default function FeedbackSection({ ideaId }: FeedbackSectionProps) {
  // Normally you'd fetch this from an API
  const feedbackList = [
    {
      id: "1",
      user: {
        name: "Alex Johnson",
        avatar: "https://i.pravatar.cc/150?img=1",
      },
      content:
        "I really like the concept! Have you considered adding a feature that would help track the environmental impact over time?",
      createdAt: "2023-10-15T08:30:00Z",
      likes: 4,
    },
    {
      id: "2",
      user: {
        name: "Sarah Miller",
        avatar: "https://i.pravatar.cc/150?img=5",
      },
      content:
        "This would be so helpful for my daily routine. I'm curious about how the data will be visualized - will there be any charts or graphs?",
      createdAt: "2023-10-14T15:45:00Z",
      likes: 2,
    },
    {
      id: "3",
      user: {
        name: "Michael Wong",
        avatar: "https://i.pravatar.cc/150?img=3",
      },
      content:
        "Would love to see this integrated with existing smart home systems. That would be a game-changer!",
      createdAt: "2023-10-13T11:20:00Z",
      likes: 7,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feedback & Comments</CardTitle>
        <CardDescription>
          Comments and suggestions from early supporters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="flex gap-2">
          <Input
            placeholder="Add a comment or question..."
            className="flex-1"
          />
          <Button>Post</Button>
        </div>

        <div className="space-y-6">
          {feedbackList.map((feedback) => (
            <div
              key={feedback.id}
              className="border-b pb-6 last:border-b-0 last:pb-0"
            >
              <div className="flex gap-3">
                <Avatar>
                  <AvatarImage
                    src={feedback.user.avatar}
                    alt={feedback.user.name}
                  />
                  <AvatarFallback>
                    {feedback.user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-sm">
                      {feedback.user.name}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{feedback.content}</p>
                  <div className="flex gap-3 pt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground"
                    >
                      <ThumbsUp className="h-3 w-3 mr-1" />
                      {feedback.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-muted-foreground"
                    >
                      <Reply className="h-3 w-3 mr-1" />
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
