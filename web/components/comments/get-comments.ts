"use server";

import { User } from "@clerk/nextjs/server";

import { api, QueryParams } from "@/lib/api";
import { getUsers } from "@/lib/auth";
import { constructNewPath, getName } from "@/lib/utils";
import { Comment, CommentExtended } from "@/types/comment";
import { cache } from "react";

export const getComments = cache(async (ideaId: string, qs?: QueryParams) => {
  try {
    const url = constructNewPath(`/ideas/${ideaId}/feedback`, qs);

    const response = await api.get(url, {
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

    if (!data || !data.comments) {
      console.error("Invalid data format:", data);
      return null;
    }

    const comments = data.comments;

    const allUserIds = getAllUserIds(comments);

    const users = await getUsers(allUserIds);

    return {
      comments: mapComments(comments, users),
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Error in getComments:", error);
    return null;
  }
});

const getAllUserIds = (commentList: Comment[]): string[] => {
  const ids = new Set<string>();

  commentList.forEach((comment) => {
    ids.add(comment.userId);

    if (comment.replies && comment.replies.length > 0) {
      const replyIds = getAllUserIds(comment.replies);
      replyIds.forEach((id) => ids.add(id));
    }
  });

  return Array.from(ids);
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
