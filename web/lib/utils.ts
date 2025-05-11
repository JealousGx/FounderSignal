import { User } from "@clerk/nextjs/server";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export const getName = (user: User) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  if (user.username) {
    return user.username;
  }

  if (user.emailAddresses[0]?.emailAddress) {
    return user.emailAddresses[0].emailAddress.split("@")[0];
  }

  return "Unknown User";
};
