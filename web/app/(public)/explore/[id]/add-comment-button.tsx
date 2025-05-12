"use client";

import { Link } from "@/components/ui/link";

export const AddCommentButton = () => {
  return (
    <Link
      href="#comment-form"
      variant="ghost"
      size="sm"
      className="text-primary font-medium"
      onClick={(e) => {
        e.preventDefault();
        const form = document.getElementById("comment-form");
        form?.scrollIntoView({ behavior: "smooth" });

        setTimeout(() => {
          const textarea = form?.querySelector("textarea");
          textarea?.focus();
        }, 500);
      }}
    >
      Add comment
    </Link>
  );
};
