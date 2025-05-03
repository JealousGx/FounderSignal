import React from "react";
import { cn } from "@/lib/utils";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  spinnerClassName?: string;
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "danger"
    | "outline"
    | "ghost";
  size?: "sm" | "md" | "lg";
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  (
    {
      className,
      children,
      isLoading = false,
      loadingText,
      spinnerClassName,
      variant = "default",
      size = "md",
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        "bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200",
      primary: "bg-blue-600 text-white hover:bg-blue-700",
      secondary: "bg-gray-600 text-white hover:bg-gray-700",
      danger: "bg-red-600 text-white hover:bg-red-700",
      outline:
        "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50",
      ghost: "bg-transparent text-gray-700 hover:bg-gray-100",
    };

    const sizeClasses = {
      sm: "px-3 py-1 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative font-medium rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed",
          variantClasses[variant],
          sizeClasses[size],
          isLoading && "cursor-not-allowed opacity-80",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <span className="absolute left-0 inset-y-0 flex items-center justify-center w-full">
            <Spinner className={cn("h-5 w-5", spinnerClassName)} />
            {loadingText && <span className="ml-2">{loadingText}</span>}
          </span>
        )}
        <span
          className={cn(
            "flex items-center justify-center",
            isLoading && "invisible"
          )}
        >
          {children}
        </span>
      </button>
    );
  }
);

LoadingButton.displayName = "LoadingButton";

const Spinner = ({ className }: { className?: string }) => {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export { LoadingButton, Spinner };
