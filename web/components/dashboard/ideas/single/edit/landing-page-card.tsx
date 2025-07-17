"use client";

import { Edit, Eye, MoreVertical, Power, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/components/ui/link";

import { deleteMvp, fetchHtmlContent, setMVPActive } from "./actions";

import { LandingPage } from "@/types/idea";

interface LandingPageCardProps {
  mvp: LandingPage;
}

export function LandingPageCard({ mvp }: LandingPageCardProps) {
  const [htmlContent, setHtmlContent] = useState<string | undefined>(
    mvp.htmlContent
  );

  const conversionRate =
    mvp.views > 0 ? ((mvp.signups / mvp.views) * 100).toFixed(2) : "0";

  const handleSetActive = async () => {
    toast.promise(setMVPActive(mvp.ideaId, mvp.id), {
      loading: "Setting as active...",
      success: "Landing page is now active!",
      error: (err) => err.error || "An error occurred.",
    });
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${mvp.name}"? This action cannot be undone.`
      )
    )
      return;

    toast.promise(deleteMvp(mvp.ideaId, mvp.id), {
      loading: "Deleting landing page...",
      success: "Landing page deleted.",
      error: (err) => err.error || "An error occurred.",
    });
  };

  useEffect(() => {
    let isMounted = true;
    if (!mvp.htmlUrl) return;

    (async () => {
      const content = await fetchHtmlContent(mvp.ideaId, mvp.id, mvp.htmlUrl);

      if (isMounted && content) {
        setHtmlContent(content);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [mvp]);

  return (
    <Card className="bg-white border-gray-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{mvp.name}</CardTitle>
            <CardDescription>
              Created on {new Date(mvp.createdAt).toLocaleDateString()}
              <br />
              Last updated on {new Date(mvp.updatedAt).toLocaleDateString()}
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {mvp.isActive && <Badge>Active</Badge>}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/mvp/${mvp.ideaId}/edit?mvpId=${mvp.id}`}
                    variant="ghost"
                    className="justify-start font-normal cursor-pointer"
                    target="_blank"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    href={`/mvp/${mvp.ideaId}?mvpId=${mvp.id}`}
                    target="_blank"
                    variant="ghost"
                    className="justify-start font-normal cursor-pointer"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview Active
                  </Link>
                </DropdownMenuItem>

                {!mvp.isActive && (
                  <DropdownMenuItem
                    onClick={handleSetActive}
                    className="font-normal cursor-pointer"
                  >
                    <Power className="mr-2 h-4 w-4" />
                    Set Active
                  </DropdownMenuItem>
                )}

                {/* <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem> */}

                <DropdownMenuItem
                  className="text-red-500 font-normal cursor-pointer"
                  onClick={handleDelete}
                  disabled={mvp.isActive}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <div className="px-6 pb-4 flex-grow">
        <div className="relative h-48 w-full overflow-hidden rounded-md border bg-muted">
          <iframe
            srcDoc={htmlContent}
            className="absolute top-0 left-0 h-[768px] w-[2045px] origin-top-left scale-[0.25] transform pointer-events-none"
            title={`Preview of ${mvp.name}`}
            sandbox="allow-scripts"
          />
        </div>
      </div>

      <CardContent className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">
            {(mvp.views || 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Views</p>
        </div>

        <div>
          <p className="text-2xl font-bold">
            {(mvp.signups || 0).toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Signups</p>
        </div>

        <div>
          <p className="text-2xl font-bold">{conversionRate}%</p>
          <p className="text-sm text-muted-foreground">Conversion</p>
        </div>
      </CardContent>
    </Card>
  );
}
