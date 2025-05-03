import { SignUpButton } from "@clerk/nextjs";

import { Link } from "./ui/link";
import { Button } from "./ui/button";

interface AuthButtonsProps {
  isSignedIn?: boolean;
  className?: string;
  variant?: "default" | "vertical";
}

export function AuthButtons({
  isSignedIn,
  variant = "default",
}: AuthButtonsProps) {
  if (isSignedIn) {
    return (
      <Link
        href="/dashboard"
        className={variant === "vertical" ? "w-full" : ""}
      >
        Dashboard
      </Link>
    );
  }

  if (variant === "vertical") {
    return (
      <SignUpButton mode="modal">
        <Button className="cursor-pointer w-full">Sign Up</Button>
      </SignUpButton>
    );
  }

  return (
    <SignUpButton mode="modal">
      <Button className="cursor-pointer">Sign Up</Button>
    </SignUpButton>
  );
}
