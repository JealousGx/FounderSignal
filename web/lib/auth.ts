import "server-only";

import { clerkClient } from "@clerk/nextjs/server";

export const clerk = async () => await clerkClient();
