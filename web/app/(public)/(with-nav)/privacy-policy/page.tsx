import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FounderSignal",
  description:
    "Understand how FounderSignal collects, uses, and protects your personal data and the content you provide.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 mb-6">Last updated: July 6, 2025</p>

        <p className="mb-4">
          Welcome to FounderSignal. We are committed to protecting your privacy.
          This Privacy Policy explains how we collect, use, disclose, and
          safeguard your information when you use our website and services.
        </p>

        <h2 className="text-xl font-semibold">1. Information We Collect</h2>
        <p>We may collect information about you in a variety of ways:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Personal Data:</strong> When you register, we collect
            personal information, such as your name, email address, and profile
            picture, through our authentication provider, Clerk.
          </li>
          <li>
            <strong>User-Generated Content:</strong> We collect the information
            you provide when you submit a startup idea, including the title,
            description, target audience, and any other materials you create or
            upload. This content, once submitted, may be publicly visible.
          </li>
          <li>
            <strong>Usage and Analytics Data:</strong> We automatically collect
            usage information when you access our services. This includes data
            about your interactions with our platform and the MVP landing pages,
            such as page views, sign-ups, conversion rates, scroll depth, and
            time spent on a page.
          </li>
          <li>
            <strong>Payment Information:</strong> When you subscribe to a paid
            plan, our payment processor (Paddle) will collect your payment
            information. We do not store your credit card details on our
            servers.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">
          2. How We Use Your Information
        </h2>
        <p>We use the information we collect to:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>Provide, operate, and maintain our services.</li>
          <li>
            Create and host MVP landing pages for your ideas, which may involve
            using AI services to generate content.
          </li>
          <li>
            Display submitted ideas and their validation metrics on
            public-facing parts of our website, like the &quot;Explore&quot;
            page.
          </li>
          <li>Process transactions and manage your subscription.</li>
          <li>
            Communicate with you, including sending service-related
            announcements and responding to inquiries.
          </li>
          <li>Analyze usage to monitor and improve our services.</li>
        </ul>

        <h2 className="text-xl font-semibold">3. Sharing Your Information</h2>
        <p>
          We do not sell your personal information. We may share information in
          the following situations:
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Publicly:</strong> Your startup ideas, descriptions, and
            associated validation data may be publicly displayed on our
            platform. Do not submit confidential information.
          </li>
          <li>
            <strong>With Service Providers:</strong> We share data with
            third-party vendors that help us operate our platform, such as our
            hosting provider, payment processor (Paddle), and authentication
            provider (Clerk).
          </li>
          <li>
            <strong>For Legal Reasons:</strong> We may disclose your information
            if required to do so by law or in response to valid requests by
            public authorities.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">
          4. Cookies and Tracking Technologies
        </h2>
        <p className="mb-4">
          We use cookies and similar tracking technologies to track the activity
          on our Service and hold certain information. Cookies are files /
          tokens with a small amount of data which may include an anonymous
          unique identifier. You can instruct your browser to refuse all cookies
          or to indicate when a cookie is being sent. However, if you do not
          accept cookies, you may not be able to use some portions of our
          Service.
        </p>

        <h2 className="text-xl font-semibold">5. Your Data Rights</h2>
        <p className="mb-4">
          You have the right to access, update, or delete the personal
          information we have on you. You can manage your account information
          through your dashboard. Please note that content submitted as ideas
          may remain on our platform as part of our public repository of
          validated ideas. Depending on your location, you may have additional
          rights under laws like GDPR or CCPA, such as the right to data
          portability or to restrict processing. To exercise any of your rights,
          please contact us.
        </p>

        <h2 className="text-xl font-semibold">6. Data Security</h2>
        <p className="mb-4">
          We use administrative, technical, and physical security measures to
          help protect your personal information. While we have taken reasonable
          steps to secure the personal information you provide to us, please be
          aware that despite our efforts, no security measures are perfect or
          impenetrable. In the event of a data breach that affects your personal
          information, we will notify you via email within 72 hours of
          discovering the breach.
        </p>

        <h2 className="text-xl font-semibold">7. Data Retention</h2>
        <p className="mb-4">
          We will retain your personal information only for as long as is
          necessary for the purposes set out in this Privacy Policy, including
          for the purposes of satisfying any legal, accounting, or reporting
          requirements. When you delete your account, we will delete your
          personal information, but may retain your anonymized user-generated
          content and usage data.
        </p>

        <h2 className="text-xl font-semibold">
          8. International Data Transfers
        </h2>
        <p className="mb-4">
          Your information, including personal data, may be transferred to — and
          maintained on — computers located outside of your state, province,
          country or other governmental jurisdiction where the data protection
          laws may differ from those from your jurisdiction. Your consent to
          this Privacy Policy followed by your submission of such information
          represents your agreement to that transfer.
        </p>

        <h2 className="text-xl font-semibold">9. Children&apos;s Privacy</h2>
        <p className="mb-4">
          Our Service is not intended for use by children under the age of 18.
          We do not knowingly collect personally identifiable information from
          children under 18. If you become aware that a child has provided us
          with personal information, please contact us.
        </p>

        <h2 className="text-xl font-semibold">
          10. Changes to This Privacy Policy
        </h2>
        <p className="mb-4">
          We may update our Privacy Policy from time to time. We will notify you
          of any changes by posting the new Privacy Policy on this page and
          updating the &quot;Last updated&quot; date. You are advised to review
          this Privacy Policy periodically for any changes.
        </p>

        <h2 className="text-xl font-semibold">11. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about this Privacy Policy, please contact us
          at{" "}
          <Link className="underline" href="mailto:support@foundersignal.com">
            support@foundersignal.com
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
