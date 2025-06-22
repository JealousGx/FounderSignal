import {
  AlertCircle,
  CheckCircle,
  Loader,
  Pencil,
  Save,
  Settings,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SaveStatus = "idle" | "saving" | "success" | "error";

export const FloatingActionMenu = ({
  onSave,
  onSettingsClick,
  isSaving,
  saveStatus,
}: {
  onSave: () => void;
  onSettingsClick: () => void;
  isSaving: boolean;
  saveStatus: SaveStatus;
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getSaveButtonContent = () => {
    switch (saveStatus) {
      case "saving":
        return <Loader className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Save className="h-4 w-4" />;
    }
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2"
      onMouseEnter={() => !isSaving && setIsMenuOpen(true)}
      onMouseLeave={() => setIsMenuOpen(false)}
    >
      <div
        className={`flex bg-background/50 backdrop-blur-sm p-2 rounded-full items-center gap-2 transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4 pointer-events-none"
        }`}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={onSave}
              disabled={isSaving}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white rounded-full w-10 h-10 p-0 shadow-lg"
            >
              {getSaveButtonContent()}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Save Landing Page</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-background hover:bg-accent text-foreground rounded-full w-10 h-10 p-0 shadow-lg border"
              onClick={onSettingsClick}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Page Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-white rounded-full w-14 h-14 p-0 shadow-lg"
          >
            {isSaving ? (
              <Loader className="w-6 h-6 animate-spin" />
            ) : (
              <Pencil className="w-6 h-6" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSaving ? "Saving..." : <p>Edit & Save</p>}
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

FloatingActionMenu.displayName = "FloatingActionMenu";
