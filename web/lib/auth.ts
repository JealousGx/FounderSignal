import "server-only";

import { clerkClient, User } from "@clerk/nextjs/server";
import { cache } from "react";

export const clerk = async () => await clerkClient();

export const getUser = cache(async (userId: string) => {
  const clerkClient = await clerk();
  const user = await clerkClient.users.getUser(userId);

  return user;
});

export const getUsers = cache(async (userIds: string[]) => {
  const clerk = await clerkClient();
  const allUsers: User[] = [];
  const batchSize = 10;

  const fetchBatch = async (ids: string[], start: number = 0) => {
    if (start >= ids.length) return;

    const batchUserIds = ids.slice(start, start + batchSize);
    try {
      const users = await clerk.users.getUserList({
        userId: batchUserIds,
        limit: batchUserIds.length,
      });
      allUsers.push(...users.data);

      if (users.data.length < batchUserIds.length) return;

      await fetchBatch(ids, start + batchSize);
    } catch (error) {
      console.error("Error fetching user batch:", error);

      await fetchBatch(ids, start + batchSize);
    }
  };

  await fetchBatch(userIds, 0);

  return allUsers;
});
