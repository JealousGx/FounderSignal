import { Metadata, ResolvingMetadata } from "next";
import React from "react";

import { OptimizedImage } from "@/components/ui/image";
import { Link } from "@/components/ui/link";

export async function generateMetadata(
  {},
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: "FounderSignal - Validate Your Startup Idea in 72 Hours",
    description:
      "Stop guessing. Start validating. FounderSignal helps you test your startup ideas with real users and data-driven insights in under 72 hours. Build your MVP, get feedback, and find your market.",
    openGraph: {
      title: "FounderSignal - Validate Your Startup Idea in 72 Hours",
      description:
        "Test your startup ideas with real users and data-driven insights. Build your MVP, get feedback, and find your market.",
      images: previousImages,
    },
    twitter: {
      title: "FounderSignal - Validate Your Startup Idea in 72 Hours",
      description:
        "Test your startup ideas with real users and data-driven insights. Build your MVP, get feedback, and find your market.",
      images: previousImages,
    },
  };
}

export default function Home() {
  return (
    <React.Fragment>
      <main className="w-full flex min-h-screen flex-col items-center gap-8">
        <section className="max-w-7xl mx-auto px-4 md:px-12 py-12 lg:py-20 w-full flex flex-col lg:flex-row justify-between gap-6 md:gap-8 lg:gap-12">
          <div className="flex flex-col space-y-6 lg:w-1/2">
            <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full w-max">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              <p className="text-sm font-medium text-primary">
                Validate faster, launch smarter
              </p>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Test startup ideas{" "}
              <span className="text-primary">in 72 hours</span>
            </h1>

            <h2 className="text-xl md:text-2xl text-gray-600">
              Real-time micro-validation with a fake MVP. No coding required.
            </h2>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/submit">Get started for free</Link>

              <Link href="#how-it-works" variant="outline">
                <span>How it works</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 ml-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
            {/* 
            <div className="pt-4">
              <p className="text-sm text-gray-500">Trusted by founders from</p>
              <div className="flex flex-wrap gap-6 items-center mt-3">
                <div className="text-gray-400 font-medium">Y Combinator</div>
                <div className="text-gray-400 font-medium">TechStars</div>
                <div className="text-gray-400 font-medium">500 Startups</div>
              </div>
            </div> */}
          </div>

          <div className="lg:w-1/2 w-full">
            <div className="relative w-full aspect-square md:aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden shadow-lg">
              <OptimizedImage
                src="/assets/images/home_hero.webp"
                alt="FounderSignal Steps"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
                objectFit="contain"
                className="w-full h-full"
              />
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="bg-primary/5 w-full py-12 lg:py-20"
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                How FounderSignal Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Validate your startup idea without writing a single line of
                code.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Describe Your Idea</h3>
                <p className="text-gray-600">
                  Tell us about your startup concept, target audience, and what
                  problem you&apos;re solving.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Create Fake MVP</h3>
                <p className="text-gray-600">
                  We build a realistic landing page with sign-up form for your
                  idea with no code required.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Collect Real Data</h3>
                <p className="text-gray-600">
                  Get actionable insights from user interest, behavior metrics,
                  and detailed analytics.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full py-12 lg:py-20 px-4 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Validation Success Stories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See how founders like you validated their ideas with
              FounderSignal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white h-full p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
                  <OptimizedImage
                    src="https://randomuser.me/api/portraits/women/33.jpg"
                    alt="Founder portrait"
                    width={64}
                    height={64}
                    objectFit="contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">MealPrep SaaS Platform</h3>
                  <p className="text-gray-600">Food Tech Startup</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 flex-grow">
                We had a hypothesis that busy professionals would pay for
                AI-generated meal plans, but weren&apos;t sure about market
                demand. FounderSignal helped us test this in just 3 days with
                200+ sign-ups and detailed feedback. The insights helped us
                refine our pricing strategy and identify key features our target
                users actually valued.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  72% Conversion Rate
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  $15K Saved
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  3 Days to Results
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden">
                  <OptimizedImage
                    src="https://randomuser.me/api/portraits/men/42.jpg"
                    alt="Founder portrait"
                    width={64}
                    height={64}
                    objectFit="contain"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg">TaskFlow AI Assistant</h3>
                  <p className="text-gray-600">Productivity SaaS</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 flex-grow">
                I was unsure if small business owners would adopt an AI task
                management tool. Within 72 hours of testing with FounderSignal,
                we collected 150+ interested users and discovered our ideal
                price point was 40% higher than initially planned.
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                  63% Conversion Rate
                </div>
                <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
                  $22K Raised Post-Validation
                </div>
                <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">
                  150+ Early Adopters
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary/5 w-full py-12 lg:py-20">
          <div className="max-w-5xl mx-auto text-center px-4 md:px-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Validate Your Startup Idea?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Join hundreds of founders who have saved time and money by testing
              their ideas first.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/submit"
                className="px-8 py-4 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                Start your validation
              </Link>
              {/* <Link href="/pricing" variant="outline" className="px-8 py-4">
                View pricing options
              </Link> */}
            </div>

            <p className="mt-6 text-gray-500">
              No credit card required to get started • 3-day results guaranteed
            </p>
          </div>
        </section>
      </main>
    </React.Fragment>
  );
}
