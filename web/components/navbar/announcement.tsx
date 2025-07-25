import { Sparkles } from "lucide-react";

import { Link } from "../ui/link";

export async function AnnouncementHeader() {
  if (!process.env.FF_ANNOUNCEMENT_COUPON_CODE) return;

  return (
    <div className="sticky top-[64px] z-40 w-full bg-background/95 border-b border-border shadow-sm flex items-center justify-center px-4 py-2 backdrop-blur-md">
      <div className="flex sm:items-center gap-4 sm:flex-row flex-col">
        <div className="flex items-center gap-2 text-primary text-wrap">
          <Sparkles className="h-5 w-5 animate-bounce" />

          <span className="font-semibold text-base md:text-lg">
            🎉 First 100 users get 25% OFF on Pro Monthly Plan!
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
          <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-sm border border-primary/20 shadow-sm select-none">
            CODE:{" "}
            <span className="font-bold tracking-wide select-all">
              {process.env.FF_ANNOUNCEMENT_COUPON_CODE}
            </span>
          </span>

          <Link href="/pricing" className="rounded-full font-medium">
            Claim Offer
          </Link>
        </div>
      </div>
    </div>
  );
}
