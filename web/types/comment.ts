export type Comment = {
  id: string;
  userId: string;
  comment: string;
  likes: number;
  dislikes: number;
  likedByUser: boolean;
  dislikedByUser: boolean;
  createdAt: string;
  replies: Comment[];
};
