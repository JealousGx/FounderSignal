"use client";

import { useEffect, useState } from "react";

import { Link } from "@/components/ui/link";
import { getCustomerPortalUrl } from "@/lib/paddle/get-customer-portal-url";
import { CreditCard } from "lucide-react";

export const ManageSubscriptions = () => {
  const [paddleCustomerPortalUrl, setPaddleCustomerPortalUrl] = useState<
    string | null
  >(null);

  useEffect(() => {
    getCustomerPortalUrl()
      .then((portalUrl) => {
        setPaddleCustomerPortalUrl(portalUrl);
      })
      .catch((error) => {
        console.error("Failed to fetch customer portal URL:", error);
      });
  }, []);

  if (!paddleCustomerPortalUrl || paddleCustomerPortalUrl === "") {
    return null;
  }

  return (
    <Link
      href={paddleCustomerPortalUrl}
      variant="ghost"
      target="_blank"
      rel="noopener noreferrer"
      className="w-full justify-start gap-2 text-gray-700"
    >
      <CreditCard className="w-5 h-5 text-gray-500" />
      Manage Subscriptions
    </Link>
  );
};
