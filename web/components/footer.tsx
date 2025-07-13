import { Link } from "@/components/ui/link";
import { BugReportTrigger } from "./shared/report-bug/trigger";

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 text-center sm:text-left">
            &copy; {new Date().getFullYear()} FounderSignal. All rights
            reserved.
          </p>

          <div className="flex items-center space-x-6">
            <Link
              href="/terms-and-conditions"
              variant="ghost"
              className="text-sm text-gray-500 hover:text-gray-900 p-0 h-auto"
            >
              Terms
            </Link>

            <Link
              href="/privacy-policy"
              variant="ghost"
              className="text-sm text-gray-500 hover:text-gray-900 p-0 h-auto"
            >
              Privacy
            </Link>

            <Link
              href="/faqs"
              variant="ghost"
              className="text-sm text-gray-500 hover:text-gray-900 p-0 h-auto"
            >
              FAQs
            </Link>

            <Link
              href="/refund"
              variant="ghost"
              className="text-sm text-gray-500 hover:text-gray-900 p-0 h-auto"
            >
              Refund Policy
            </Link>

            <BugReportTrigger variant="footer" />
          </div>
        </div>
      </div>
    </footer>
  );
}
