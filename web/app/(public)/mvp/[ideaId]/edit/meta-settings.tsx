import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CustomTooltip } from "./custom-tooltip";

interface MetaSettingsModalProps {
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  metaTitle: string;
  setMetaTitle: (title: string) => void;
  metaDescription: string;
  setMetaDescription: (description: string) => void;
}

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;

export const MetaSettingsModal = ({
  isModalOpen,
  setIsModalOpen,
  metaTitle,
  setMetaTitle,
  metaDescription,
  setMetaDescription,
}: MetaSettingsModalProps) => {
  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Page Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-7 mt-4">
          <div className="flex flex-col gap-4">
            <div>
              <Label
                className="flex gap-2 items-center text-sm font-medium mb-1"
                htmlFor="meta-title"
              >
                Page Title
                <CustomTooltip text="This is the title of your page, which appears in the browser tab and is important for SEO." />
              </Label>
              <Input
                id="meta-title"
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder="Enter page title (for SEO and browser tab)"
                maxLength={MAX_TITLE_LENGTH}
              />
            </div>

            <div>
              <Label
                className="flex gap-2 items-center text-sm font-medium mb-1"
                htmlFor="meta-description"
              >
                Meta Description
                <CustomTooltip text="This is the meta description for your page, which appears in search results and social media previews." />
              </Label>
              <Textarea
                id="meta-description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder="Enter meta description (for SEO and social sharing)"
                maxLength={MAX_DESCRIPTION_LENGTH}
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setIsModalOpen(false)}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

MetaSettingsModal.displayName = "MetaSettingsModal";
