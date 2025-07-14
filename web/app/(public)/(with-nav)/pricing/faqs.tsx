import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { prepareFaqLdJson } from "@/lib/prepare-faq-ldjson";

const faqs = [
  {
    question: "Is there a free trial available?",
    answer:
      "Our 'Starter' plan is completely free and allows you to validate your first idea. It's a great way to experience the core features of FounderSignal without any commitment.",
  },
  {
    question: "What's included in the Free (Starter) plan?",
    answer:
      "The Starter plan allows you to validate your first startup idea without any cost. You get access to our AI for 3 generations to refine your concept and can create a basic MVP landing page with essential engagement tracking. This plan is perfect for getting your feet wet and experiencing the power of rapid idea validation. Please note: Reddit validation is not included in the Starter plan.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. When you upgrade, you'll be charged a prorated amount. When you downgrade, the new plan will take effect at the end of your current billing cycle.",
  },
  {
    question: "Do you offer discounts for annual subscriptions?",
    answer:
      "Yes, we offer a 20% discount when you choose an annual subscription for both our Pro and Business plans. This is a great way to save money if you plan to use FounderSignal consistently throughout the year for ongoing validation and iteration.",
  },
  {
    question: "What happens when I cancel my subscription?",
    answer:
      "You can cancel your subscription at any time. You will retain access to all your plan's features until the end of your current billing period. We don't offer refunds for partial months.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We partner with Paddle to handle our payments, which means we accept all major credit cards (Visa, Mastercard, American Express), PayPal, and other local payment methods depending on your country.",
  },
  {
    question: "Do you offer discounts for annual billing?",
    answer:
      "Yes! We offer a 20% discount if you choose to pay annually. You can select the annual option on the pricing toggle to see the savings. The discount is applied automatically at checkout.",
  },
  {
    question: "What's the main difference between the Pro and Business plans?",
    answer:
      "The Pro plan offers significant advantages for active founders, including the ability to validate up to 10 ideas simultaneously, access to private testing mode for confidential concepts, and facilitated Reddit validation for each idea. The Business plan (launching with 1000 ideas and priority support, with more features like custom domains coming soon) is designed for high-volume users, agencies, or incubators, offering massive scalability and exclusive premium features for advanced validation needs.",
  },
];

const faqSchema = prepareFaqLdJson(faqs);

export function FAQs() {
  return (
    <section className="w-full max-w-4xl mx-auto py-16 md:py-24 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Frequently Asked Questions
        </h2>

        <p className="text-lg text-gray-600 mt-2">
          Have questions? We&apos;ve got answers.
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

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </section>
  );
}
