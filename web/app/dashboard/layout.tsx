import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import DashboardHeader from "@/components/dashboard/header";
import DashboardSidebar from "@/components/dashboard/sidebar";
import MobileDashboardNav from "@/components/dashboard/sidebar/mobile-nav";

import { ActivityProvider } from "@/contexts/activity-context";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  return (
    <ActivityProvider>
      <div className="min-h-screen flex">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>

        <div className="flex-1 flex flex-col w-full">
          <div className="md:hidden px-4 py-3 border-b border-gray-200 bg-white">
            <MobileDashboardNav />
          </div>

          <div className="hidden md:block">
            <DashboardHeader />
          </div>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </ActivityProvider>
  );
}
