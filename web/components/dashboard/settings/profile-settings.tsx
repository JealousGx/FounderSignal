"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ClerkLoaded, UserButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

const profileSchema = z.object({
  title: z.string().max(50, "Title cannot be more than 50 characters"),
  location: z.string().max(100, "Location cannot be more than 100 characters"),
  bio: z.string().max(500, "Bio cannot be more than 500 characters"),
  company: z
    .string()
    .max(100, "Company name cannot be more than 100 characters"),
  website: z
    .string()
    .url("Please enter a valid URL")
    .or(z.string().length(0))
    .optional(),
});

interface ProfileSettingsProps {
  userId: string;
  settings: any;
}

export default function ProfileSettings({
  userId,
  settings,
}: ProfileSettingsProps) {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      title: settings?.profile?.title || "",
      location: settings?.profile?.location || "",
      bio: settings?.profile?.bio || "",
      company: settings?.profile?.company || "",
      website: settings?.profile?.website || "",
    },
  });

  async function onSubmit(data: z.infer<typeof profileSchema>) {
    setIsLoading(true);

    try {
      // In a real app, this would update the user's profile data
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and how it appears to other users.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <ClerkLoaded>
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={user?.imageUrl}
                  alt={user?.fullName || "User"}
                />
                <AvatarFallback>
                  {user?.firstName?.charAt(0)}
                  {user?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-medium">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
                <p className="text-sm text-muted-foreground">
                  Member since{" "}
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
            </ClerkLoaded>
          </div>

          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Your basic profile information is managed through your Clerk
              account.
            </p>

            <UserButton />
          </div>

          <Separator className="my-6" />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Professional title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Founder & CEO" {...field} />
                    </FormControl>
                    <FormDescription>
                      This will be displayed on your profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Your company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="City, Country" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://yourwebsite.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell others a little about yourself..."
                        className="min-h-28"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Brief description for your profile. Maximum 500
                      characters.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save changes
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
