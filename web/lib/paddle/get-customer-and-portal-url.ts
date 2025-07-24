"use server";

import { cache } from "react";

import { getPaddleInstance } from ".";
import { getUser } from "../auth";

export const getCustomerPortalUrlAndUser = cache(async () => {
  const user = await getUser();

  if (!user) return null;

  const portalSession = user.paddleCustomerId
    ? await getPaddleInstance()?.customerPortalSessions.create(
        user.paddleCustomerId,
        []
      )
    : null;

  return { url: portalSession?.urls?.general?.overview ?? null, user };
});
