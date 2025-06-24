import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

export const CustomTooltip = ({ text }: { text: string }) => {
  return (
    <Tooltip>
      <TooltipTrigger>
        <Info className="text-muted-foreground w-4 h-4" />
      </TooltipTrigger>
      <TooltipContent
        className="bg-accent-foreground max-w-sm"
        arrowClasses="bg-accent-foreground fill-accent-foreground"
      >
        {text}
      </TooltipContent>
    </Tooltip>
  );
};

CustomTooltip.displayName = "CustomTooltip";
