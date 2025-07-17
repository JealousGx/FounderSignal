import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { CustomTooltip } from "./custom-tooltip";

interface AIGenerateModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onGenerate: (
    title: string,
    description: string,
    ctaBtnText: string,
    instructions: string
  ) => Promise<void>;
  initialTitle?: string;
  initialDescription?: string;
  isEditAIGenerate?: boolean;
}

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;
const MAX_CTA_BTN_TEXT_LENGTH = 30;
const MAX_INSTRUCTIONS_LENGTH = 500;

export const AIGenerateModal = ({
  isModalOpen,
  setIsModalOpen,
  onGenerate,
  initialTitle = "",
  initialDescription = "",
  isEditAIGenerate = false,
}: AIGenerateModalProps) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [ctaBtnText, setCtaBtnText] = useState("Get Early Access");
  const [instructions, setInstructions] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateClick = async () => {
    if (!isEditAIGenerate) {
      if (!title || !description) {
        alert("Title and Description are required.");
        return;
      }

      if (title.length > MAX_TITLE_LENGTH) {
        alert(`Title cannot exceed ${MAX_TITLE_LENGTH} characters.`);
        return;
      }

      if (description.length > MAX_DESCRIPTION_LENGTH) {
        alert(
          `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`
        );
        return;
      }

      if (instructions.length > MAX_INSTRUCTIONS_LENGTH) {
        alert(
          `Instructions cannot exceed ${MAX_INSTRUCTIONS_LENGTH} characters.`
        );
        return;
      }
    }

    setIsGenerating(true);
    await onGenerate(title, description, ctaBtnText, instructions);
    setIsGenerating(false);
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [isModalOpen, initialTitle, initialDescription]);

  if (!isModalOpen) return null;

  let heading = "Generate With AI";
  let subheading =
    "Describe your idea, and our AI will generate a landing page for you. The current content in the editor will be replaced.";

  if (isEditAIGenerate) {
    heading = "Edit AI Generated Content";
    subheading =
      "Modify the AI generated content before saving it to your MVP.";
  }

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{subheading}</DialogDescription>
        </DialogHeader>

        <div className="space-y-7 mt-4">
          <div className="flex flex-col gap-4">
            {!isEditAIGenerate && (
              <>
                <div>
                  <Label
                    className="flex gap-2 items-center text-sm font-medium mb-1"
                    htmlFor="title"
                  >
                    Product / Idea Title
                    <CustomTooltip text="Enter the title of your product or idea. This will be used as the main heading on the landing page." />
                  </Label>

                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter product/idea title"
                    maxLength={MAX_TITLE_LENGTH}
                  />
                </div>

                <div>
                  <Label
                    className="flex gap-2 items-center text-sm font-medium mb-1"
                    htmlFor="description"
                  >
                    Description
                    <CustomTooltip text="Enter a brief description of your product or idea. This will be used to generate the landing page content." />
                  </Label>

                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a brief description of your product/idea"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    rows={3}
                  />
                </div>

                <div>
                  <Label
                    className="flex gap-2 items-center text-sm font-medium mb-1"
                    htmlFor="ctaBtnText"
                  >
                    CTA Button Text
                    <CustomTooltip text="Enter the text for the call-to-action button on your landing page. This is what users will click to take action." />
                  </Label>

                  <Input
                    id="ctaBtnText"
                    value={ctaBtnText}
                    onChange={(e) => setCtaBtnText(e.target.value)}
                    placeholder="Enter call-to-action button text"
                    maxLength={MAX_CTA_BTN_TEXT_LENGTH}
                  />
                </div>
              </>
            )}

            <div>
              <Label
                className="flex gap-2 items-center text-sm font-medium mb-1"
                htmlFor="instructions"
              >
                Additional Instructions
                <CustomTooltip text="Optional: Provide additional instructions or context for the AI to generate a more tailored landing page. This can include specific features, target audience, or any other relevant details." />
              </Label>

              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="e.g., Use a dark theme, make it playful, target audience is developers..."
                rows={3}
                maxLength={MAX_INSTRUCTIONS_LENGTH}
                className="max-w-md"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              onClick={handleGenerateClick}
              disabled={isGenerating}
              className="bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 min-w-[95px]"
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              ) : (
                "Generate"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

AIGenerateModal.displayName = "AIGenerateModal";
