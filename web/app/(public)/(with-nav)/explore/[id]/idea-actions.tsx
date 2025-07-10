"use client";

import { useUser } from "@clerk/nextjs";
import { Settings } from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";

interface IdeaActionsProps {
  ideaId: string;
  ideaUserId: string;
}

export function IdeaActions({ ideaId, ideaUserId }: IdeaActionsProps) {
  const { user } = useUser();
  const isCreator = user?.id === ideaUserId;

  if (!isCreator) return null;

  return (
    <CustomLink
      href={`/dashboard/ideas/${ideaId}/edit`}
      size="icon"
      variant="outline"
      className="bg-transparent border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
    >
      <Settings className="w-4 h-4" />
    </CustomLink>
  );
}
