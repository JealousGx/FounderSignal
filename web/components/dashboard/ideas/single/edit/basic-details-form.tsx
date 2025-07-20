"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle,
  FileText,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import dynamic from "next/dynamic";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { uploadImageWithSignedUrl } from "@/components/shared/image-upload/actions";
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { Idea } from "@/types/idea";
import { updateIdea, UpdateIdeaState } from "./actions";
import { UpdateIdeaFormValues, updateIdeaSchema } from "./schema";

const ImageUpload = dynamic(
  () =>
    import("@/components/shared/image-upload").then((mod) => mod.ImageUpload),
  {
    loading: () => (
      <div className="flex items-center justify-center h-32">
        Loading image upload...
      </div>
    ),
    ssr: false,
  }
);

interface BasicDetailsFormProps {
  idea: Idea;
}

export default function BasicDetailsForm({ idea }: BasicDetailsFormProps) {
  const [state, formAction, isPending] = useActionState<
    UpdateIdeaState | null,
    FormData
  >(updateIdea, null);

  const [, startTransition] = useTransition();

  const [iconUrl, setIconUrl] = useState(idea.imageUrl || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string>();
  const [isUploading, setIsUploading] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Initialize form with existing idea data
  const form = useForm<UpdateIdeaFormValues>({
    resolver: zodResolver(updateIdeaSchema),
    defaultValues: {
      title: idea.title,
      description: idea.description,
      status: idea.status,
      stage: idea.stage,
      targetAudience: idea.targetAudience,
      targetSignups: idea.targetSignups,
      imageUrl: idea.imageUrl,
    },
  });

  async function onSubmit(data: UpdateIdeaFormValues) {
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("status", data.status);
      formData.append("stage", data.stage);
      formData.append("ideaId", idea.id);
      formData.append("targetAudience", data.targetAudience);
      formData.append("targetSignups", String(data.targetSignups));

      if (selectedFile) {
        const fileName = generateIconFileName(idea.id);

        setFileUploaded(false);
        setUploadError("");
        setIsUploading(true);

        const contentType = selectedFile.type || "image/png";

        const _buff = await selectedFile.arrayBuffer();
        const base64String = Buffer.from(_buff).toString("base64");

        const uploadResult = await uploadImageWithSignedUrl(
          base64String,
          fileName,
          contentType
        );

        setIsUploading(false);
        setFileUploaded(uploadResult.uploaded);

        if (uploadResult.error) {
          setUploadError(uploadResult.error);
          toast.error("Error uploading icon", {
            description: uploadResult.error,
            duration: 5000,
          });

          return;
        }

        if (uploadResult.imageUrl) {
          setIconUrl(uploadResult.imageUrl);
          formData.append("imageUrl", uploadResult.imageUrl);
        }
      }

      startTransition(() => {
        formAction(formData);
      });
    } catch (error) {
      toast.error("Error updating idea", {
        description:
          "There was a problem updating your idea. Please try again.",
      });
      console.error("Error updating idea:", error);
    }
  }

  function handleIconRemove() {
    setIconUrl("");
    setUploadError("");
    form.setValue("imageUrl", "");
  }

  const handleFileSelect = (file: File) => {
    const validation = validateIconFile(file);
    if (!validation.valid) {
      setUploadError(validation.error);
      return;
    }

    setSelectedFile(file);
    setUploadError("");
  };

  useEffect(() => {
    // Reset form values when idea changes
    form.reset({
      title: idea.title,
      description: idea.description,
      status: idea.status,
      stage: idea.stage,
      targetAudience: idea.targetAudience,
      targetSignups: idea.targetSignups,
      imageUrl: idea.imageUrl,
    });
    setIconUrl(idea.imageUrl || "");
  }, [idea, form]);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
      if (state.fieldErrors) {
        for (const [fieldName, message] of Object.entries(state.fieldErrors)) {
          if (message) {
            form.setError(fieldName as keyof UpdateIdeaFormValues, {
              type: "server",
              message,
            });
          }
        }
      }
    }
    if (state?.message && !state.error) {
      toast.success("Idea updated successfully!", {
        description: "Your idea details have been successfully updated.",
      });

      form.reset();

      if (formRef.current) {
        formRef.current.reset();
      }
    }
  }, [state, form]);

  const statusColors = {
    active: "bg-green-100 text-green-800 border-green-200",
    paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
    draft: "bg-gray-100 text-gray-800 border-gray-200",
    completed: "bg-blue-100 text-blue-800 border-blue-200",
    archived: "bg-slate-100 text-slate-800 border-slate-200",
  };

  const stageColors = {
    ideation: "bg-purple-100 text-purple-800 border-purple-200",
    validation: "bg-orange-100 text-orange-800 border-orange-200",
    mvp: "bg-emerald-100 text-emerald-800 border-emerald-200",
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Basic Details</h2>
          <p className="text-sm text-gray-600">
            Edit the core information about your idea
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          ref={formRef}
          className="space-y-8"
        >
          {/* Basic Information Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-lg">Basic Information</CardTitle>
              </div>
              <CardDescription>
                Core details that define your idea and its purpose
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="imageUrl"
                render={() => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Product Icon
                    </FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={iconUrl}
                        onChange={handleFileSelect}
                        onRemove={() => handleIconRemove()}
                        error={uploadError}
                        isUploading={isUploading}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      A distinctive icon that represents your product. This will
                      be used across your landing page and other platforms.
                    </FormDescription>
                    <FormMessage className="w-max">
                      {fileUploaded && !isUploading && (
                        <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Icon uploaded successfully</span>
                        </div>
                      )}
                    </FormMessage>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Product Title
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your product title"
                        {...field}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      A clear, memorable name for your product
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
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Description
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe what your product does and the problem it solves"
                        className="min-h-[120px] border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Explain your product&apos;s value proposition and key
                      benefits
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Target Audience & Goals Section */}
          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-lg">
                  Target Audience & Goals
                </CardTitle>
              </div>
              <CardDescription>
                Define who your product is for and what success looks like
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="targetAudience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>Target Audience</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Describe your ideal customers"
                        {...field}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Who will benefit most from your product?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetSignups"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Target Signups</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter your target number of signups"
                        {...field}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      How many signups do you aim to achieve for validation?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-2">
                <Settings className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-lg">Status & Stage</CardTitle>
              </div>
              <CardDescription>
                Track your product&apos;s current status and development stage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Status
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="active">
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColors.active}>
                                Active
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="paused">
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColors.paused}>
                                Paused
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="draft">
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColors.draft}>
                                Draft
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="completed">
                            <div className="flex items-center space-x-2">
                              <Badge className={statusColors.completed}>
                                Completed
                              </Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-500">
                        The current status of your product
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
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Development Stage
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select development stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white">
                          <SelectItem value="ideation">
                            <div className="flex items-center space-x-2">
                              <Badge className={stageColors.ideation}>
                                Ideation
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="validation">
                            <div className="flex items-center space-x-2">
                              <Badge className={stageColors.validation}>
                                Validation
                              </Badge>
                            </div>
                          </SelectItem>
                          <SelectItem value="mvp">
                            <div className="flex items-center space-x-2">
                              <Badge className={stageColors.mvp}>MVP</Badge>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-xs text-gray-500">
                        The current development phase
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Save Changes</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const ALLOWED_ICON_TYPES = [
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const MAX_ICON_SIZE = 2 * 1024 * 1024; // 2MB

function validateIconFile(file: File) {
  if (!ALLOWED_ICON_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a valid icon file (SVG, PNG, JPEG, or WebP)",
    };
  }

  if (file.size > MAX_ICON_SIZE) {
    return {
      valid: false,
      error: "Icon file size must be less than 2MB",
    };
  }

  return { valid: true };
}

function generateIconFileName(ideaId: string) {
  return `${ideaId}/icon`;
}
