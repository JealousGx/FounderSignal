"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface DangerZoneProps {
  ideaId: string;
}

export default function DangerZone({ ideaId }: DangerZoneProps) {
  const [confirmText, setConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function handleDeleteIdea() {
    try {
      setIsDeleting(true);

      // TODO: Replace with actual API call to delete the idea
      console.log("Deleting idea:", ideaId);

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.success("Idea deleted", {
        description: "Your idea has been successfully deleted.",
      });

      // Redirect to ideas list page
      router.push("/dashboard/ideas");
    } catch (error) {
      toast.error("Error deleting idea", {
        description:
          "There was a problem deleting your idea. Please try again.",
      });
      console.error("Error deleting idea:", error);
      setIsDeleting(false);
    }
  }

  const isDeleteButtonDisabled = confirmText !== "delete";

  return (
    <Card className="border-red-200">
      <CardHeader className="text-red-700">
        <CardTitle>Danger Zone</CardTitle>
        <CardDescription className="text-red-600/80">
          Irreversible actions for your idea
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full">
              Delete This Idea
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                idea, landing page, and all collected data including email
                signups.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="py-2">
              <Label htmlFor="confirm" className="text-sm font-medium">
                Type <span className="font-bold">delete</span> to confirm
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="mt-2"
                placeholder="delete"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteIdea}
                disabled={isDeleteButtonDisabled || isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete Idea"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
