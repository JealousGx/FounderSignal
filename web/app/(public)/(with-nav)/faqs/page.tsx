import { Metadata } from "next";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "FAQ - Your Startup Idea Validation Questions Answered",
  description:
    "Get answers to common questions about FounderSignal, the AI-powered platform for rapid startup idea validation, MVP landing pages, and market testing.",
  urlPath: "faqs",
});

const faqs = [
  {
    question: "What is FounderSignal and how does it help founders?",
    answer: (
      <>
        FounderSignal is an{" "}
        <strong>AI-powered platform designed for startup founders</strong> to
        quickly <strong>validate business ideas</strong> and minimize risk. We
        help you create high-converting <strong>MVP landing pages</strong> in
        minutes, collect crucial <strong>user engagement data</strong>, and
        facilitate <strong>early market feedback</strong> to ensure you build
        something people truly want. Our goal is to save you time and money by
        confirming market demand before you invest heavily in development.
      </>
    ),
  },
  {
    question: "Who should use FounderSignal for their startup idea?",
    answer: (
      <>
        FounderSignal is ideal for <strong>aspiring entrepreneurs</strong>,{" "}
        <strong>first-time founders</strong>,{" "}
        <strong>serial entrepreneurs</strong>, and{" "}
        <strong>startup teams</strong> looking to efficiently test new concepts.
        If you have an idea but need to quickly prove market demand, understand
        user interest, and get actionable feedback without extensive coding or
        design, FounderSignal is built for you.
      </>
    ),
  },
  {
    question:
      "How is FounderSignal different from just building a simple landing page myself or using generic website builders?",
    answer: (
      <>
        Generic website builders or manual coding offer flexibility, but
        FounderSignal provides a <strong>specialized</strong>,{" "}
        <strong>end-to-end idea validation workflow</strong> designed
        specifically for founders. We integrate{" "}
        <strong>AI-powered idea generation</strong>,{" "}
        <strong>optimized landing page templates for conversion</strong>, and
        crucial <strong>engagement tracking</strong> and{" "}
        <strong>feedback mechanisms (like Reddit validation)</strong>, all in
        one place. This saves you immense time and effort, ensuring your
        validation process is structured, data-driven, and focused on proving
        market demand, rather than just building a page.
      </>
    ),
  },
  {
    question:
      "Many tools offer AI for brainstorming. What makes FounderSignal's AI unique for validation?",
    answer: (
      <>
        While many tools offer general AI brainstorming, FounderSignal&apos;s AI
        is specifically fine-tuned for{" "}
        <strong>
          startup idea generation and refinement tailored for validation
        </strong>
        . Our AI helps you craft clear, concise value propositions and messaging
        that are effective for testing market interest, directly feeding into
        your landing page creation. It&apos;s about translating raw ideas into
        testable hypotheses, not just generating generic concepts.
      </>
    ),
  },
  {
    question:
      "What are the risks of validating an idea manually, and how does FounderSignal mitigate them?",
    answer: (
      <>
        Manual idea validation can be time-consuming, prone to bias, and lack
        sufficient data for informed decisions. Risks include{" "}
        <strong>wasting development time on unproven ideas</strong>,
        misinterpreting feedback, and struggling to reach a broad, relevant
        audience. FounderSignal mitigates these by offering{" "}
        <strong>rapid</strong>, <strong>data-driven validation</strong>,
        <strong>structured feedback collection</strong>, and methods like our
        streamlined Reddit validation to efficiently gather unbiased insights,
        significantly reducing your time-to-validation and overall startup risk.
      </>
    ),
  },
  {
    question:
      "How does FounderSignal help me avoid common pitfalls like launching a product nobody wants?",
    answer: (
      <>
        The biggest pitfall for founders is building a product without confirmed
        market demand. FounderSignal directly addresses this by forcing you to
        <strong>validate interest before you code</strong>. Through our{" "}
        <strong>MVP landing page testing</strong> and{" "}
        <strong>real-time engagement analytics</strong>, you gain concrete
        evidence of demand. This allows you to pivot early, refine your concept
        based on real user data, or even abandon an unviable idea quickly,
        saving significant resources compared to building in a vacuum.
      </>
    ),
  },
  {
    question: "How does the idea validation process work with FounderSignal?",
    answer: (
      <>
        Our process is streamlined into three core steps:
        <ul className="list-disc pl-5 mt-2">
          <li>
            <strong>AI Idea Generation & Refinement:</strong> Use our AI to
            refine your initial concept or generate new variations.
          </li>

          <li>
            <strong>Rapid Landing Page Creation:</strong> Instantly create
            professional, conversion-focused landing pages for your idea - no
            coding or design skills needed.
          </li>

          <li>
            <strong>Engagement Tracking & Feedback:</strong> Launch your page,
            collect real user engagement data (page views, clicks, sign-ups),
            and leverage our integrated tools for targeted market feedback,
            including Reddit validation for higher tiers. This data helps you
            make informed decisions.
          </li>
        </ul>
      </>
    ),
  },
  {
    question: "Can I validate any type of business idea with FounderSignal?",
    answer: (
      <>
        Yes, FounderSignal is highly versatile. Our platform is effective for
        validating a wide range of business models, including{" "}
        <strong>SaaS products</strong>, <strong>e-commerce concepts</strong>,{" "}
        <strong>mobile app ideas</strong>, <strong>digital services</strong>,
        and more. As long as your idea can be effectively presented and tested
        through a focused landing page to gauge interest, FounderSignal can help
        you validate it.
      </>
    ),
  },
  {
    question:
      "What exactly is 'AI generation' and how does it help me with my idea?",
    answer: (
      <>
        Our <strong>AI generation</strong> feature uses advanced algorithms to
        help you brainstorm, articulate, and refine your startup idea. You can
        input a basic concept, and the AI will suggest clear value propositions,
        target audiences, and even initial messaging for your{" "}
        <strong>MVP landing page</strong>. This accelerates your idea
        development phase, giving you a strong foundation for validation.
      </>
    ),
  },
  {
    question:
      "How does FounderSignal facilitate 'Reddit validation' and why is it important?",
    answer: (
      <>
        <strong>Reddit validation</strong> with FounderSignal is a powerful,
        <strong>AI-driven market intelligence feature</strong> for Pro and
        Business plan users. We go beyond simple guidance: our AI{" "}
        <strong>analyzes thousands of relevant Reddit communities</strong> to
        uncover critical insights. This includes identifying{" "}
        <strong>pain points</strong>, performing{" "}
        <strong>market assessments</strong>, highlighting{" "}
        <strong>emerging trends</strong>, understanding the{" "}
        <strong>voice of the customer</strong>, and mapping the{" "}
        <strong>competitive landscape</strong>. It also helps you spot{" "}
        <strong>startup opportunities</strong> and understand{" "}
        <strong>key patterns</strong> in top Reddit threads. This deep analysis
        provides unfiltered, raw feedback and crucial{" "}
        <strong>early market traction</strong>, helping you make data-backed
        decisions and avoid common pitfalls.
      </>
    ),
  },
  {
    question: "What is 'Private testing mode' and when should I use it?",
    answer: (
      <>
        <strong>Private testing mode</strong> (available on Pro and Business
        plans) allows you to share your validation landing page with a select,
        trusted audience only. This is ideal for{" "}
        <strong>confidential startup ideas</strong> or when you want to gather
        initial feedback from a small group of advisors, potential beta users,
        or investors before a wider public launch. It ensures your idea remains
        discreet until you&apos;re ready to scale.
      </>
    ),
  },
  {
    question:
      "What kind of analytics and engagement data can I see for my ideas?",
    answer: (
      <>
        FounderSignal provides <strong>real-time analytics</strong> on your
        landing pages to show you how users interact with your idea. You&apos;ll
        track essential metrics such as <strong>page views</strong>,{" "}
        <strong>unique visitors</strong>,{" "}
        <strong>call-to-action click-through rates (CTR)</strong>, and{" "}
        <strong>form submission conversions</strong>. This data provides clear
        insights into user interest and helps you understand if your message
        resonates.
      </>
    ),
  },
  {
    question: "Can I use my own custom domain for my validation landing pages?",
    answer: (
      <>
        Currently, validation landing pages are hosted on FounderSignal.
        However,{" "}
        <strong>
          custom domain support is a highly requested feature and is planned for
          implementation
        </strong>{" "}
        as an exclusive enhancement for our Business plan in the near future.
        This will allow you to brand your validation pages with your own domain
        (e.g.,{" "}
        <code className="bg-gray-300 px-1.5 rounded">
          validate.mycompany.com
        </code>
        ), providing a more professional and seamless experience for your
        potential customers and significantly enhancing your brand credibility.
        Stay tuned for updates on its release!
      </>
    ),
  },
  {
    question:
      "Is my idea data and personal information secure with FounderSignal?",
    answer: (
      <>
        Absolutely. We prioritize the{" "}
        <strong>security and privacy of your startup ideas and data</strong>.
        FounderSignal uses industry-standard encryption, secure servers, and
        robust data protection measures to ensure your information is safe. Your
        ideas are confidential and accessible only by you.
      </>
    ),
  },
  {
    question: "Who owns the data collected from my landing pages?",
    answer: (
      <>
        <strong>You retain full ownership of all data collected</strong> through
        your FounderSignal landing pages. We simply provide the tools for you to
        collect, track, and analyze this data. You can export your data at any
        time.
      </>
    ),
  },
  {
    question: "Can I invite team members to collaborate on ideas?",
    answer: (
      <>
        <strong>Team collaboration features</strong> are a planned enhancement
        for our Business plan. Currently, accounts are individual, but we
        understand the importance of teamwork in startups and are actively
        working on this functionality for future releases.
      </>
    ),
  },
  {
    question: "How can I get support if I have questions or issues?",
    answer: (
      <>
        We&apos;re here to help! You can reach our support team by email at{" "}
        <a
          href="mailto:support@foundersignal.app"
          className="underline text-secondary-foreground"
        >
          support@foundersignal.app
        </a>
        . Business plan users receive <strong>priority support</strong> for
        expedited assistance. We also plan to build out a comprehensive
        knowledge base with tutorials and guides.
      </>
    ),
  },
  {
    question:
      "Do you have any resources or guides on idea validation best practices?",
    answer: (
      <>
        Yes! We regularly publish articles and guides on our{" "}
        <a
          href="https://medium.com/@jealousgx"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-secondary-foreground"
        >
          Medium blog
        </a>{" "}
        covering startup idea validation best practices, MVP development, market
        research, and more. We believe in empowering founders with both the
        tools and the knowledge to succeed.
      </>
    ),
  },
  {
    question:
      "What happens to my data if I delete an idea or my entire account?",
    answer: (
      <>
        At FounderSignal, we offer clear data deletion processes:
        <ul className="list-disc pl-5 mt-2">
          <li>
            <strong>Deleting an individual idea or resource:</strong> When you
            delete an idea or a landing page, we perform a soft delete. This
            means the content is no longer visible or active but is held for a
            short period to allow you to restore it if it was deleted by
            mistake.
          </li>

          <li>
            <strong>Deleting your entire FounderSignal account:</strong> If you
            decide to delete your complete FounderSignal account, all your
            personal data, including all your ideas and associated resources,
            will be permanently hard-deleted from our systems. This action is
            irreversible, and your data cannot be recovered once your account is
            deleted.
          </li>
        </ul>
      </>
    ),
  },
];

export default function FAQsPage() {
  return (
    <section className="w-full max-w-4xl mx-auto py-16 md:py-24 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          FounderSignal FAQs: Validate Your Startup Ideas with Confidence
        </h1>

        <p className="text-lg text-gray-600 mt-2">
          Find quick answers about our AI-powered idea generation, MVP landing
          page creation, market testing features, and how FounderSignal helps
          you build successful businesses.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem value={`item-${index}`} key={index}>
            <AccordionTrigger className="text-lg text-left font-medium">
              {faq.question}
            </AccordionTrigger>

            <AccordionContent className="text-base text-gray-700">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
