import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar";
import MobileDashboardNav from "@/components/dashboard/sidebar/mobile-nav";
import DashboardHeader from "@/components/dashboard/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //   const { userId } = await auth();

  //   // Redirect unauthenticated users to sign in
  //   if (!userId) {
  //     redirect("/sign-in");
  //   }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar navigation */}
      <div className="hidden md:block">
        <DashboardSidebar />
      </div>

      {/* Main content area */}
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
  );
}
