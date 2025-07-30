import Link from "next/link";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function NextStepsModal({
  open,
  onClose,
  ideaId,
}: {
  open: boolean;
  onClose: () => void;
  ideaId: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-xl animate-in fade-in-90 zoom-in-95 overflow-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary">
            🎉 Idea Submitted!
          </DialogTitle>

          <DialogDescription className="text-muted-foreground mt-2">
            Fantastic! Here&apos;s what you can do next to manage your idea.
          </DialogDescription>

          {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-3 my-4 text-blue-900 text-base">
            🚀 We&apos;re now working on creating an MVP for your idea. Once
            it&apos;s ready, you&apos;ll receive an email notification with all
            the details. Stay tuned!
          </div> */}
        </DialogHeader>

        <div className="py-4">
          <ol className="list-decimal ml-6 space-y-4 text-lg">
            <li>
              <Link
                href={`/dashboard/ideas`}
                className="text-primary hover:underline font-medium flex items-center group"
              >
                Go to your dashboard
                <span className="ml-2 text-sm text-gray-400 group-hover:text-primary-foreground transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <p className="text-sm text-muted-foreground mt-1">
                View all your submitted ideas and track their status.
              </p>
            </li>

            <li>
              <Link
                href={`/dashboard/ideas/${ideaId}`}
                className="text-primary hover:underline font-medium flex items-center group"
              >
                View your idea details
                <span className="ml-2 text-sm text-gray-400 group-hover:text-primary-foreground transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <p className="text-sm text-muted-foreground mt-1">
                Dive deeper into the specifics of your newly submitted idea.
              </p>
            </li>

            <li>
              <Link
                href={`/dashboard/ideas/${ideaId}/edit`}
                className="text-primary hover:underline font-medium flex items-center group"
              >
                Edit or improve your idea
                <span className="ml-2 text-sm text-gray-400 group-hover:text-primary-foreground transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <p className="text-sm text-muted-foreground mt-1">
                Refine your pitch, add details, or even craft a dedicated
                landing page for your idea.
              </p>
            </li>

            <li>
              <Link
                href={`/mvp/${ideaId}`}
                className="text-primary hover:underline font-medium flex items-center group"
              >
                Visit your MVP page
                <span className="ml-2 text-sm text-gray-400 group-hover:text-primary-foreground transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-right"
                  >
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </Link>

              <p className="text-sm text-muted-foreground mt-1">
                View your MVP page to see how your idea is being brought to
                life.{" "}
                <span className="font-semibold">
                  Please note: The MVP might not be immediately available. You
                  may need to wait a few seconds and refresh the page or edit it
                  from your dashboard for it to appear.
                </span>
              </p>
            </li>

            <li>
              <p
                onClick={onClose}
                className="text-primary hover:underline font-medium flex items-center group cursor-pointer"
              >
                Stay here
                <span className="ml-2 text-sm text-gray-400 group-hover:text-primary-foreground transition-colors duration-200">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-arrow-left"
                  >
                    <path d="M19 12H5" />
                    <path d="m12 19-7-7 7-7" />
                  </svg>
                </span>
              </p>

              <p className="text-sm text-muted-foreground mt-1">
                Close this dialog and continue working on the current page.
              </p>
            </li>
          </ol>
        </div>

        <DialogFooter className="mt-4">
          <Button onClick={onClose} className="w-full">
            Got it!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
