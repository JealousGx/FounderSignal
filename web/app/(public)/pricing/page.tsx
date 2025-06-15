import { PricingSection } from "./pricing-section";

export default async function Pricing() {
  return (
    <main className="w-full flex min-h-screen flex-col items-center">
      <section className="max-w-7xl mx-auto px-4 md:px-12 w-full flex flex-col items-center">
        <h1 className="text-[3rem] font-bold text-gray-900 mb-4 text-center">
          Find the Perfect Plan
          <br />
          For Your Next Big Idea
        </h1>

        <p className="text-lg text-gray-700 mb-6">
          Unlock powerful tools to validate and grow your venture.
        </p>
      </section>

      <PricingSection />
    </main>
  );
}
