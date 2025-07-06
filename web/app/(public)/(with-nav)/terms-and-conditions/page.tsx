import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms and Conditions | FounderSignal",
  description:
    "Read the terms and conditions for using the FounderSignal platform.",
};

export default function TermsAndConditionsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
      <div className="prose prose-lg max-w-none">
        <h1 className="text-3xl font-bold mb-2">Terms and Conditions</h1>
        <p className="text-gray-500 mb-6">Last updated: July 6, 2025</p>

        <p className="mb-4">
          Please read these Terms and Conditions (&quot;<strong>Terms</strong>
          &quot;) carefully before using the FounderSignal website and services
          (the &quot;<strong>Service</strong>&quot;) operated by us.
        </p>

        <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the Service, you agree to be bound by these
          Terms. If you disagree with any part of the terms, then you may not
          access the Service.
        </p>

        <h2 className="text-xl font-semibold">2. Description of Service</h2>
        <p className="mb-4">
          FounderSignal provides users with tools to create and test MVP
          (Minimum Viable Product) landing pages for startup ideas. Users can
          submit ideas, which are then used to generate landing pages for market
          validation. These ideas and their performance metrics may be shared
          publicly.{" "}
          <strong>
            AI-generated content may contain inaccuracies and should be reviewed
            before use.
          </strong>
        </p>

        <h2 className="text-xl font-semibold">3. User-Generated Content</h2>
        <p className="mb-4">
          You are solely responsible for the content you submit, including its
          legality, reliability, and appropriateness. By submitting content, you
          grant FounderSignal a worldwide, non-exclusive, royalty-free license
          to use, reproduce, display, and distribute your content in connection
          with the Service.
        </p>
        <p className="mb-4">
          <strong>
            You agree not to submit any information that is confidential or that
            you do not have the right to share.
          </strong>{" "}
          All ideas submitted to the platform are considered non-confidential.
        </p>

        <h2 className="text-xl font-semibold">4. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            Submit any content that is unlawful, harmful, or infringes on the
            rights of others.
          </li>
          <li>
            Impersonate any person or entity or falsely state or otherwise
            misrepresent your affiliation with a person or entity.
          </li>
          <li>
            Attempt to gain unauthorized access to the Service or its related
            systems or networks.
          </li>
        </ul>

        <h2 className="text-xl font-semibold">
          5. Community Guidelines and Content Moderation
        </h2>
        <p className="mb-4">
          Our platform is designed for constructive feedback. By posting
          comments, you agree to the following rules:
        </p>
        <ul className="mb-4 list-disc pl-6">
          <li>
            <strong>Be Respectful:</strong> Do not post content that is
            defamatory, abusive, harassing, threatening, or an invasion of a
            right of privacy of another person.
          </li>
          <li>
            <strong>Stay On-Topic:</strong> Comments should be relevant to the
            startup idea being discussed. Spam, promotions, and irrelevant
            discussions are not permitted.
          </li>
          <li>
            <strong>Provide Constructive Feedback:</strong> While critical
            feedback is welcome, it must be constructive and respectful.
            Personal attacks are not allowed.
          </li>
        </ul>
        <p className="mb-4">
          <strong>Content Moderation:</strong> Idea creators are responsible for
          moderating the comments section of their own ideas and are empowered
          to remove comments that violate these guidelines. However,
          FounderSignal reserves the right, in its sole discretion, to remove
          any content or comments and to terminate user accounts for violating
          these terms without prior notice.
        </p>

        <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
        <p className="mb-4">
          The Service and its original content (excluding content provided by
          users), features, and functionality are and will remain the exclusive
          property of FounderSignal and its licensors. Our trademarks may not be
          used in connection with any product or service without our prior
          written consent.
        </p>

        <h2 className="text-xl font-semibold">7. Termination</h2>
        <p className="mb-4">
          We may terminate or suspend your account immediately, without prior
          notice or liability, for any reason whatsoever, including without
          limitation if you breach the Terms.
        </p>

        <h2 className="text-xl font-semibold">8. Disclaimer of Warranties</h2>
        <p className="mb-4">
          The Service is provided on an &quot;AS IS&quot; and &quot;AS
          AVAILABLE&quot; basis. We do not warrant that the results of using the
          Service will meet your requirements or that the service will be
          uninterrupted or error-free. We reserve the right to modify, suspend,
          or discontinue the Service at any time without notice.
        </p>

        <h2 className="text-xl font-semibold">9. Limitation of Liability</h2>
        <p className="mb-4">
          In no event shall FounderSignal, nor its directors, employees,
          partners, or agents, be liable for any indirect, incidental, special,
          consequential or punitive damages, including without limitation, loss
          of profits, data, or other intangible losses, resulting from your
          access to or use of or inability to access or use the Service. This
          includes any damages arising from third-party services we integrate
          with.
        </p>

        <h2 className="text-xl font-semibold">10. Governing Law</h2>
        <p className="mb-4">
          These Terms shall be governed in accordance with the laws of Pakistan,
          without regard to its conflict of law provisions.
        </p>

        <h2 className="text-xl font-semibold">11. Dispute Resolution</h2>
        <p className="mb-4">
          Any dispute arising from these Terms or your use of the Service will
          be resolved through binding arbitration in Karachi, Pakistan. Both
          parties agree to waive their right to a trial by jury or to
          participate in a class action lawsuit.
        </p>

        <h2 className="text-xl font-semibold">12. Indemnification</h2>
        <p className="mb-4">
          You agree to indemnify and hold harmless FounderSignal and its
          employees, agents, and affiliates from and against any claims,
          liabilities, damages, losses, and expenses, including, without
          limitation, reasonable legal and accounting fees, arising out of or in
          any way connected with your access to or use of the Service or your
          violation of these Terms.
        </p>

        <h2 className="text-xl font-semibold">13. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right, at our sole discretion, to modify or replace
          these Terms at any time. We will provide notice of any changes by
          posting the new Terms on this page.
        </p>

        <h2 className="text-xl font-semibold">14. Contact Us</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at{" "}
          <a className="underline" href="mailto:support@foundersignal.com">
            support@foundersignal.com
          </a>
          .
        </p>
      </div>
    </main>
  );
}
