import { Metadata } from "next";

import { FAQs } from "./faqs";
import { PricingSection } from "./pricing-section";

import { createMetadata } from "@/lib/metadata";

export const metadata: Metadata = createMetadata({
  title: "Pricing Plans",
  description:
    "Choose the right plan for your startup validation needs. From free starter plans to comprehensive business packages, find the perfect fit on FounderSignal.",
  urlPath: "pricing",
});

export default async function Pricing() {
  return (
    <main className="w-full flex min-h-screen flex-col items-center">
      <section className="max-w-7xl mx-auto px-4 md:px-12 w-full flex flex-col items-center pt-20">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-center">
          Find the Perfect Plan For
          <br />
          Your Next Big Idea
        </h1>

        <p className="text-lg text-gray-700 mb-6 text-center max-w-2xl mx-auto">
          Unlock powerful tools to validate and grow your venture.
        </p>
      </section>

      <PricingSection />
      <FAQs />
    </main>
  );
}
