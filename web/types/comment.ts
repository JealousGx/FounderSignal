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

export type CommentExtended = Omit<Comment, "replies"> & {
  content: string;
  author: {
    name: string;
    image: string;
  };
  replies: CommentExtended[];
};
