import { Loader2 } from "lucide-react";

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
import { useAIGenerateForm } from "./hooks/use-ai-generate-form";

export interface AIGenerateModalProps {
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

export const AIGenerateModal = (props: AIGenerateModalProps) => {
  const { isModalOpen, setIsModalOpen, isEditAIGenerate = false } = props;

  const { values, errors, isGenerating, handleInputChange, handleSubmit } =
    useAIGenerateForm(props);

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

        <form onSubmit={handleSubmit} className="space-y-7 mt-4">
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
                    value={values.title}
                    onChange={handleInputChange}
                    placeholder="Enter product/idea title"
                    maxLength={MAX_TITLE_LENGTH}
                  />

                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                  )}
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
                    value={values.description}
                    onChange={handleInputChange}
                    placeholder="Enter a brief description of your product/idea"
                    maxLength={MAX_DESCRIPTION_LENGTH}
                    rows={3}
                  />

                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description}
                    </p>
                  )}
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
                    value={values.ctaBtnText}
                    onChange={handleInputChange}
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
                Instructions
                <CustomTooltip text="Provide instructions or context for the AI to generate a more tailored landing page. This can include specific features, target audience, or any other relevant details." />
              </Label>

              <Textarea
                id="instructions"
                value={values.instructions}
                onChange={handleInputChange}
                placeholder="e.g., Use a dark theme, make it playful, target audience is developers..."
                rows={3}
                maxLength={MAX_INSTRUCTIONS_LENGTH}
                className="max-w-md"
              />
              {errors.instructions && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.instructions}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              disabled={isGenerating}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

AIGenerateModal.displayName = "AIGenerateModal";
