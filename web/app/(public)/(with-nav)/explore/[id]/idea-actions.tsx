"use client";

import { useUser } from "@clerk/nextjs";
import { Eye, Settings } from "lucide-react";

import { Link as CustomLink } from "@/components/ui/link";

interface IdeaActionsProps {
  ideaId: string;
  ideaUserId: string;
}

export function IdeaActions({ ideaId, ideaUserId }: IdeaActionsProps) {
  const { user } = useUser();
  const isCreator = user?.id === ideaUserId;

  return (
    <div className="flex items-center gap-2">
      <CustomLink
        href={`/mvp/${ideaId}`}
        target="_blank"
        variant="outline"
        className="bg-transparent border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors"
      >
        <Eye className="w-4 h-4 mr-1.5" />
        View Live MVP
      </CustomLink>

      {isCreator && (
        <CustomLink
          href={`/dashboard/ideas/${ideaId}/edit`}
          size="icon"
          variant="outline"
          className="bg-transparent border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </CustomLink>
      )}
    </div>
  );
}
