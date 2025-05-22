"use client";

import { useRouter } from "next/navigation";

import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4 text-lg">
          Sorry, the page you are looking for does not exist.
        </p>
        <Button onClick={handleGoHome} className="mt-6">
          Go to Home
        </Button>
      </div>
    </>
  );
};

export default NotFound;
