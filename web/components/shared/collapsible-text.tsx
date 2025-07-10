"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

interface CollapsibleTextProps {
  text: string;
  charLimit?: number;
}

export function CollapsibleText({
  text,
  charLimit = 100,
}: CollapsibleTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (text.length <= charLimit) {
    return <p className="text-sm text-gray-800">{text}</p>;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div>
      <p className="text-sm text-gray-800">
        {isExpanded ? text : `${text.substring(0, charLimit)}...`}
      </p>
      <Button
        variant="link"
        size="sm"
        onClick={toggleExpanded}
        className="p-0 h-auto text-xs"
      >
        {isExpanded ? "Show Less" : "Show More"}
      </Button>
    </div>
  );
}
