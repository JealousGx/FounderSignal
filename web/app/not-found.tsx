import { Metadata } from "next";

import { Footer } from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { Link } from "@/components/ui/link";

import { createMetadata } from "@/lib/metadata";

export const revalidate = 31536000; // 1 year in seconds

export const metadata: Metadata = createMetadata({
  title: "Page Not Found - FounderSignal",
  description:
    "The page you are looking for does not exist. Please check the URL or return to the home page.",
  robots: { index: false, follow: false },
});

const NotFound = () => {
  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center h-screen text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4 text-lg">
          Sorry, the page you are looking for does not exist.
        </p>
        <Link href="/" className="mt-6" variant="default">
          Go to Home
        </Link>
      </div>

      <Footer />
    </>
  );
};

export default NotFound;
