import { Link } from "@/components/ui/link";
import { CheckCircle } from "lucide-react";

export default function CheckoutSuccessPage() {
  return (
    <div className="h-screen bg-gray-100 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />

        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Payment Successful!
        </h2>

        <p className="mt-2 text-sm text-gray-600">
          Thank you for your purchase. You will receive an email confirmation
          shortly with details.
        </p>

        <div className="mt-2">
          <Link href="/dashboard">Go to dashboard</Link>
        </div>
      </div>
    </div>
  );
}
