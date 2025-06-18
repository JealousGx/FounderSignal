"use server";

import { cache } from "react";
import { getPaddleInstance } from ".";
import { getUser } from "../auth";

export const getCustomerPortalUrl = cache(async () => {
  const user = await getUser();
  if (!user || !user.paddleCustomerId) return null;

  const portalSession = await getPaddleInstance().customerPortalSessions.create(
    user.paddleCustomerId,
    []
  );

  return portalSession.urls.general.overview;
});
