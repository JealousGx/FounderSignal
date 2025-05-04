import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function WelcomeBanner() {
  const { userId } = await auth();
  const { firstName } = await getUserDetails(userId as string);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 lg:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
            Welcome back, {firstName}
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Here&apos;s what&apos;s happening with your validation projects
          </p>
        </div>
        <div className="hidden md:block">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Idea
          </Link>
        </div>
      </div>
    </div>
  );
}

// Mock function - replace with actual implementation
async function getUserDetails(userId: string) {
  // In a real app, fetch from API or database
  return { firstName: "Alex" };
}
