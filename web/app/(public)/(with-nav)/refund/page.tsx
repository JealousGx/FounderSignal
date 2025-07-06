import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Refund Policy | FounderSignal",
  description:
    "Understand the refund policy for FounderSignal's subscription services.",
};

export default function RefundPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-2">Refund Policy</h1>
        <p className="text-gray-500 mb-6">Last updated: July 6, 2025</p>

        <h2 className="text-xl font-semibold">Our Policy</h2>
        <p className="mb-4">
          Due to the nature of our services, which include immediate access to
          digital tools, platform resources, and the generation of assets upon
          subscription,{" "}
          <strong>
            we do not offer refunds or credits for any subscription fees
          </strong>
          . This includes fees for monthly or annual subscription plans.
        </p>

        <h2 className="text-xl font-semibold">Cancellation</h2>
        <p className="mb-4">
          You can cancel your subscription at any time from your account
          dashboard. When you cancel, your subscription will remain active until
          the end of your current paid billing cycle. You will not be charged
          for the next cycle.
        </p>
        <p className="mb-4">
          For example, if you are on a monthly plan and you cancel halfway
          through the month, you will retain access to your plan&apos;s features
          until the month ends, but you will not receive a refund for the
          remainder of the month.
        </p>

        <h2 className="text-xl font-semibold">Free Plan</h2>
        <p className="mb-4">
          We offer a free &quot;Starter&quot; plan that allows you to experience
          the core features of FounderSignal before committing to a paid
          subscription. We encourage you to use this plan to determine if our
          service is the right fit for your needs.
        </p>

        <h2 className="text-xl font-semibold">Exceptional Circumstances</h2>
        <p className="mb-4">
          We reserve the right to issue refunds or credits on a case-by-case
          basis at our sole discretion. A decision to provide a refund in one
          instance does not obligate us to provide a refund in any other
          instance, including for similar issues. This may include situations
          involving verified billing errors or other extenuating circumstances
          we deem appropriate.
        </p>

        <h2 className="text-xl font-semibold">Contact Us</h2>
        <p className="mb-4">
          If you have any questions about our Refund Policy, please contact us
          at{" "}
          <a className="underline" href="mailto:support@foundersignal.com">
            support@foundersignal.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
