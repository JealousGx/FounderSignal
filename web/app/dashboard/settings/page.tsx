import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PageHeader from "@/components/dashboard/settings/header";
import ProfileSettings from "@/components/dashboard/settings/profile-settings";
import NotificationSettings from "@/components/dashboard/settings/notification-settings";
import AppearanceSettings from "@/components/dashboard/settings/appearance-settings";
import { getUserSettings } from "@/lib/api";
import { auth } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  //   const { userId } = await auth();

  //   if (!userId) {
  //     // Handle the case where user is not authenticated
  //     return (
  //       <div className="flex items-center justify-center h-[50vh]">
  //         <p>Please sign in to view settings</p>
  //       </div>
  //     );
  //   }

  const userId = "user_123"; // Replace with actual user ID from auth

  const settings = await getUserSettings(userId);

  return (
    <div className="space-y-6 pb-16">
      <PageHeader />

      <Tabs defaultValue="profile" className="space-y-6">
        <div className="border-b">
          <TabsList className="bg-transparent -mb-px">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>

            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="profile" className="space-y-6">
          <div className="max-w-2xl">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <ProfileSettings userId={userId} settings={settings} />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <div className="max-w-2xl">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <NotificationSettings userId={userId} settings={settings} />
            </Suspense>
          </div>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <div className="max-w-2xl">
            <Suspense fallback={<Skeleton className="h-48 w-full" />}>
              <AppearanceSettings userId={userId} settings={settings} />
            </Suspense>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
