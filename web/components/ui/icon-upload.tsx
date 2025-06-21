"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, Image as ImageIcon, X } from "lucide-react";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/ui/image";

interface IconUploadProps {
  value?: string;
  onChange: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  isUploading?: boolean;
}

export function IconUpload({
  value,
  onChange,
  onRemove,
  disabled = false,
  className,
  error,
  isUploading = false,
}: IconUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragReject, setIsDragReject] = useState(false);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file) return;
      onChange(file);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
    setIsDragReject(false);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set drag active to false if we're leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragActive(false);
      setIsDragReject(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if the dragged items are valid files
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) {
          const allowedTypes = [
            "image/svg+xml",
            "image/png",
            "image/jpeg",
            "image/webp",
          ];
          if (!allowedTypes.includes(file.type)) {
            setIsDragReject(true);
          } else {
            setIsDragReject(false);
          }
        }
      }
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setIsDragActive(false);
      setIsDragReject(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;

      const file = files[0];
      handleFileSelect(file);
    },
    [handleFileSelect]
  );

  return (
    <div className={cn("space-y-4 w-max", className)}>
      {value ? (
        <div className="relative group">
          <div className="relative w-24 h-24 mx-auto rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
            <OptimizedImage
              src={value}
              alt="Product icon"
              fill
              className="object-contain p-2"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
            disabled={disabled || isUploading}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 cursor-pointer",
            "hover:border-primary/50 hover:bg-primary/5",
            isDragActive && !isDragReject && "border-primary bg-primary/10",
            isDragReject && "border-destructive bg-destructive/10",
            disabled && "opacity-50 cursor-not-allowed",
            isUploading && "pointer-events-none"
          )}
        >
          <label htmlFor="icon-upload" className="block cursor-pointer">
            <input
              id="icon-upload"
              type="file"
              accept=".svg,.png,.jpg,.jpeg,.webp"
              className="hidden"
              onChange={handleInputChange}
              disabled={disabled || isUploading}
            />

            <div className="flex flex-col items-center justify-center space-y-3">
              {isUploading ? (
                <>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-medium text-gray-900">
                      Uploading icon...
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors",
                      isDragActive && !isDragReject
                        ? "bg-primary/10"
                        : "bg-gray-50",
                      isDragReject && "bg-destructive/10"
                    )}
                  >
                    {isDragReject ? (
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    ) : (
                      <ImageIcon className="h-6 w-6 text-gray-400" />
                    )}
                  </div>

                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      {isDragActive && !isDragReject
                        ? "Drop your icon here"
                        : isDragReject
                          ? "Invalid file type"
                          : "Upload product icon"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isDragReject
                        ? "Please use SVG, PNG, JPEG, or WebP files"
                        : "SVG, PNG, JPEG, WebP up to 2MB"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </label>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
