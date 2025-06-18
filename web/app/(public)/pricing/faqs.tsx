import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is there a free trial available?",
    answer:
      "Our 'Starter' plan is completely free and allows you to validate your first idea. It's a great way to experience the core features of FounderSignal without any commitment.",
  },
  {
    question: "Can I change my plan later?",
    answer:
      "Yes, you can upgrade or downgrade your plan at any time from your account settings. When you upgrade, you'll be charged a prorated amount. When you downgrade, the new plan will take effect at the end of your current billing cycle.",
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
];

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
    </section>
  );
}
