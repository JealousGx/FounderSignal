"use server";

import { cache } from "react";

import { api, QueryParams } from "@/lib/api";
import { getUsers } from "@/lib/auth";
import { constructNewPath } from "@/lib/utils";
import { User } from "@clerk/nextjs/server";

export const getAudience = cache(
  async (getStats: boolean = false, qs?: QueryParams) => {
    try {
      const url = constructNewPath("/dashboard/audience", { ...qs, getStats });
      const response = await api.get(url, {
        cache: "force-cache",
        next: {
          revalidate: 3600,
          tags: [`audience`],
        },
      });

      if (!response.ok) {
        console.error(
          "API error fetching getAudience:",
          response.status,
          response.statusText
        );

        return null;
      }

      const data = await response.json();

      if (!data || !data.audiences || data.audiences.length === 0) {
        console.error("No audience data found");
        return null;
      }

      const userIds = getAllUserIds(data.audiences);
      const users = await getUsers(userIds);

      return {
        ...data,
        audiences: mapUsersToAudience(data.audiences, users),
      };
    } catch (error) {
      console.error("Error in getAudience:", error);
      return null;
    }
  }
);

const getAllUserIds = (audienceList: Record<string, string>[]) => {
  const ids = new Set<string>();

  audienceList.forEach((audience) => {
    ids.add(audience.userId);
  });

  return Array.from(ids);
};

const mapUsersToAudience = (
  audiences: Record<string, string>[],
  users: User[]
) => {
  const userMap = new Map(users.map((user) => [user.id, user]));
  return audiences.map((audience) => {
    const user = userMap.get(audience.userId);

    return {
      ...audience,
      idea: {
        id: audience.ideaId,
        title: audience.ideaTitle,
      },
      email: user?.emailAddresses[0]?.emailAddress || "unknown user",
    };
  });
};
