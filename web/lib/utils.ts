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

export const getName = ({
  firstName,
  lastName,
  username,
  emailAddresses,
}: User) => {
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }

  if (username) {
    return username;
  }

  if (emailAddresses[0]?.emailAddress) {
    return emailAddresses[0].emailAddress.split("@")[0];
  }

  return "Anonymous";
};
