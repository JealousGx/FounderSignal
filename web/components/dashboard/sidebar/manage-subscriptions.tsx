"use client";

import { AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Link as CustomLink } from "@/components/ui/link";
import { getIdeaLimitByTier } from "@/constants/pricing-tier";
import { getCustomerPortalUrlAndUser } from "@/lib/paddle/get-customer-and-portal-url";

export const ManageSubscriptions = () => {
  const [paddleCustomerPortalUrl, setPaddleCustomerPortalUrl] = useState<
    string | null
  >(null);
  const [userActiveIdeasCount, setUserActiveIdeasCount] = useState(0);
  const [plan, setPlan] = useState<"starter" | "pro" | "business">("starter");

  useEffect(() => {
    getCustomerPortalUrlAndUser()
      .then((data) => {
        if (!data) {
          console.warn("No user data found or user not authenticated.");
          return;
        }

        if (data.user) {
          setUserActiveIdeasCount(data.user.activeIdeaCount || 0);
          setPlan(data.user.plan || "starter");
        }

        if (!data.url) {
          console.warn(
            "No customer portal URL found or user not authenticated."
          );
          return;
        }

        setPaddleCustomerPortalUrl(data.url);
      })
      .catch((error) => {
        console.error("Failed to fetch customer portal URL:", error);
      });
  }, []);

  const planLimit = getIdeaLimitByTier(plan);
  const overLimit =
    typeof planLimit === "number" && typeof userActiveIdeasCount === "number"
      ? userActiveIdeasCount >= planLimit
      : false;

  return (
    <>
      {overLimit && (
        <div className="mb-2 px-3 py-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-yellow-500" />

          <p>
            You have reached your active idea limit. Please{" "}
            <Link href="/pricing" className="underline text-yellow-600">
              upgrade
            </Link>{" "}
            to continue adding new ideas.
          </p>
        </div>
      )}

      {paddleCustomerPortalUrl && (
        <CustomLink
          href={paddleCustomerPortalUrl}
          variant="ghost"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full justify-start gap-0 text-gray-700"
        >
          <CreditCard className="w-5 h-5 mr-3 text-gray-500" />
          Manage Subscriptions
        </CustomLink>
      )}
    </>
  );
};
