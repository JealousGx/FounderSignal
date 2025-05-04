"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Idea } from "@/types/idea";

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  status: z.enum(["Active", "Paused", "Draft", "Completed"]),
  stage: z.enum(["Ideation", "Validation", "MVP"]),
  imageUrl: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BasicDetailsFormProps {
  idea: Idea;
}

export default function BasicDetailsForm({ idea }: BasicDetailsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(idea.imageUrl || null);

  // Initialize form with existing idea data
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: idea.title,
      description: idea.description,
      status: idea.status,
      stage: idea.stage,
      imageUrl: idea.imageUrl,
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      setIsSubmitting(true);

      // TODO: Replace with actual API call to update the idea
      console.log("Form submitted with:", data);

      // Simulating API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("Idea updated successfully!", {
        description: "Your idea details have been successfully updated.",
      });
    } catch (error) {
      toast.error("Error updating idea", {
        description:
          "There was a problem updating your idea. Please try again.",
      });
      console.error("Error updating idea:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real app, you would upload the file to your storage service
    // and get back a URL to use

    // For now, we'll just create a local object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewImage(objectUrl);
    form.setValue("imageUrl", objectUrl);
  }

  function removeImage() {
    setPreviewImage(null);
    form.setValue("imageUrl", "");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Details</CardTitle>
        <CardDescription>
          Edit the core information about your idea
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your idea title" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, concise name for your idea.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your idea in detail"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Explain what your idea does and the problem it solves.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Paused">Paused</SelectItem>
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The current status of your idea.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stage</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select validation stage" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Ideation">Ideation</SelectItem>
                        <SelectItem value="Validation">Validation</SelectItem>
                        <SelectItem value="MVP">MVP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      The current development stage.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormItem>
              <FormLabel>Featured Image</FormLabel>
              <div className="space-y-4">
                {previewImage ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Idea preview"
                      fill
                      className="object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-8 w-8"
                      onClick={removeImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG (MAX. 2MB)
                        </p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                )}
                <FormDescription>
                  Upload an image that represents your idea. This will be
                  displayed on the landing page.
                </FormDescription>
              </div>
            </FormItem>

            <div className="flex justify-end">
              <Button
                type="submit"
                className="min-w-[120px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
