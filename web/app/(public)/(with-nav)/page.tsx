import { ChartBar, Lightbulb, Monitor } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import { YouTubeFacade } from "@/components/shared/youtube-facade";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { OptimizedImage } from "@/components/ui/image";
import { Link as CustomLink } from "@/components/ui/link";

import { createMetadata } from "@/lib/metadata";
import { prepareFaqLdJson } from "@/lib/prepare-faq-ldjson";

import { testimonials } from "@/data/testimonials";

// export const revalidate = 86400; // 24 hours

const TwitterIcon = () => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden="true"
    className="h-5 w-5 fill-current text-gray-500"
  >
    <g>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
    </g>
  </svg>
);

export const metadata: Metadata = createMetadata({
  title: "FounderSignal - Validate Your Startup Idea in 72 Hours",
  description:
    "Stop guessing. Start validating. FounderSignal helps you test your startup ideas with real users and data-driven insights in under 72 hours. Build your MVP, get feedback, and find your market.",
});

const faqs = [
  {
    question: "What exactly is a 'fake MVP'?",
    answer: (
      <>
        A &quot;fake MVP&quot; is a realistic, no-code landing page that
        describes your product or service and captures user interest (e.g.,
        email sign-ups, pre-orders). It looks and feels like a real product
        page, but the backend functionality is simulated to gather demand data
        before you build anything.
      </>
    ),
    schemaAnswer:
      'A "fake MVP" is a realistic, no-code landing page that describes your product or service and captures user interest (e.g., email sign-ups, pre-orders). It looks and feels like a real product page, but the backend functionality is simulated to gather demand data before you build anything.',
  },
  {
    question: "How does the 72-hour validation work?",
    answer: (
      <>
        Once you define your idea, we launch your no-code MVP. We then collect
        real user interactions. Our dashboard provides live analytics and
        AI-summarized feedback.
      </>
    ),
    schemaAnswer:
      "Once you define your idea, we launch your no-code MVP. We then collect real user interactions. Our dashboard provides live analytics and AI-summarized feedback.",
  },
  {
    question: "What kind of insights will I get?",
    answer: (
      <>
        You&apos;ll receive data on unique visitors, conversion rates
        (sign-ups), user demographics (if collected), and qualitative feedback
        via surveys or comments. Our AI provides summaries and actionable
        recommendations based on this data.
      </>
    ),
    schemaAnswer:
      "You will receive data on unique visitors, conversion rates (sign-ups), user demographics (if collected), and qualitative feedback via surveys or comments. Our AI provides summaries and actionable recommendations based on this data.",
  },
  {
    question: "Is my idea safe and private?",
    answer: (
      <>
        Absolutely. Your idea details and all collected user data are kept
        confidential and secure. We do not share your proprietary information.
      </>
    ),
    schemaAnswer:
      "Absolutely. Your idea details and all collected user data are kept confidential and secure. We do not share your proprietary information.",
  },
  {
    question: "What happens after I validate my idea?",
    answer: (
      <>
        With concrete data and user insights, you&apos;ll have the confidence to
        proceed with building your actual product, pivot your idea, or even seek
        funding with proven market demand. FounderSignal provides the clarity
        you need for your next step.
      </>
    ),
    schemaAnswer:
      "With concrete data and user insights, you'll have the confidence to proceed with building your actual product, pivot your idea, or even seek funding with proven market demand. FounderSignal provides the clarity you need for your next step.",
  },
];

const faqSchema = prepareFaqLdJson(
  faqs.map((faq) => ({ question: faq.question, answer: faq.schemaAnswer }))
);

export default async function Home() {
  // const totalUsers =
  //   (await clerk()
  //     .then((c) => c.users.getCount())
  //     .catch((err) => {
  //       console.error("Error fetching user count:", err);
  //       return 0;
  //     })) || 0;

  return (
    <main className="w-full flex min-h-screen flex-col items-center gap-8">
      <section className="max-w-7xl mx-auto px-4 md:px-12 py-12 lg:py-20 w-full flex flex-col lg:flex-row justify-between gap-6 md:gap-8 lg:gap-12 items-center">
        <div className="flex flex-col space-y-6 lg:w-1/2 justify-center lg:items-start items-center text-center lg:text-left">
          <div className="inline-flex items-center px-3 py-1.5 bg-primary/10 rounded-full w-max">
            <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            <p className="text-sm font-medium text-primary">
              Stop guessing. Start validating.
            </p>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Validate Your Startup Idea{" "}
            <span className="text-primary">in 72 Hours</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl">
            Get real-time market insights with a{" "}
            <strong>no-code fake MVP</strong>. Understand user demand, refine
            your concept, and <strong>launch with confidence.</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <CustomLink href="/submit">Start Your Free Validation</CustomLink>

            <CustomLink href="#how-it-works" variant="outline">
              <span>How It Works</span>
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
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
            </CustomLink>
          </div>
          {/* 
          <div className="mt-8 pt-4 border-t border-gray-200">
            <p className="text-4xl md:text-5xl font-extrabold text-primary">
              {totalUsers.toLocaleString()}+
            </p>
            <p className="text-lg text-gray-700 mt-2">
              Founders already validating their ideas
            </p>
          </div> */}
        </div>

        <div className="lg:w-1/2 w-full mt-8 lg:mt-0">
          <YouTubeFacade
            videoId="3hjUeTAXixw"
            title="FounderSignal Platform Demo"
            options={{
              autoplay: true,
              mute: true,
              loop: true,
              playlist: "3hjUeTAXixw",
              playsinline: true,
              controls: false,
              showinfo: false,
              modestbranding: true,
              iv_load_policy: 3,
            }}
            embed={true}
          />
        </div>
      </section>

      <section id="how-it-works" className="bg-primary/5 w-full py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How FounderSignal Works in 3 Simple Steps
            </h2>

            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Validate your startup idea without writing a single line of code.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Lightbulb className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-xl font-bold mb-3">Describe Your Idea</h3>

              <p className="text-gray-600 max-w-md mx-auto">
                Tell us about your startup concept, target audience, and the
                problem you&apos;re solving. Our AI helps refine your pitch.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Monitor className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                Create Your No-Code MVP
              </h3>

              <p className="text-gray-600 max-w-md mx-auto">
                Generate a realistic landing page with a sign-up form, tailored
                to your idea - no coding, no design skills needed.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <ChartBar className="h-8 w-8 text-primary" />
              </div>

              <h3 className="text-xl font-bold mb-3">
                Collect Real-Time Insights
              </h3>

              <p className="text-gray-600 max-w-md mx-auto">
                Get actionable insights from user interest, conversion rates,
                and detailed analytics. Our AI summarizes key feedback.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto w-full py-12 lg:py-20 px-4 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See How FounderSignal Validates
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore a concrete example of how we help founders test their ideas
            effectively.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 justify-center items-center">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col items-center text-center max-w-sm">
            <div className="w-20 h-20 mb-4 flex items-center justify-center">
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                version="1.1"
                width="256"
                height="256"
                viewBox="0 0 256 256"
                xmlSpace="preserve"
              >
                <g
                  style={{
                    stroke: "none",
                    strokeWidth: 0,
                    strokeDasharray: "none",
                    strokeLinecap: "butt",
                    strokeLinejoin: "miter",
                    strokeMiterlimit: 10,
                    fill: "none",
                    fillRule: "nonzero",
                    opacity: 1,
                  }}
                  transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
                >
                  <circle
                    cx="45"
                    cy="45"
                    r="45"
                    style={{
                      stroke: "none",
                      strokeWidth: 1,
                      strokeDasharray: "none",
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeMiterlimit: 10,
                      fill: "rgb(255,69,0)",
                      fillRule: "nonzero",
                      opacity: 1,
                    }}
                    transform="  matrix(1 0 0 1 0 0) "
                  />
                  <path
                    d="M 75.011 45 c -0.134 -3.624 -3.177 -6.454 -6.812 -6.331 c -1.611 0.056 -3.143 0.716 -4.306 1.823 c -5.123 -3.49 -11.141 -5.403 -17.327 -5.537 l 2.919 -14.038 l 9.631 2.025 c 0.268 2.472 2.483 4.262 4.955 3.993 c 2.472 -0.268 4.262 -2.483 3.993 -4.955 s -2.483 -4.262 -4.955 -3.993 c -1.421 0.145 -2.696 0.973 -3.4 2.204 L 48.68 17.987 c -0.749 -0.168 -1.499 0.302 -1.667 1.063 c 0 0.011 0 0.011 0 0.022 l -3.322 15.615 c -6.264 0.101 -12.36 2.025 -17.55 5.537 c -2.64 -2.483 -6.801 -2.36 -9.284 0.291 c -2.483 2.64 -2.36 6.801 0.291 9.284 c 0.515 0.481 1.107 0.895 1.767 1.186 c -0.045 0.66 -0.045 1.32 0 1.98 c 0 10.078 11.745 18.277 26.23 18.277 c 14.485 0 26.23 -8.188 26.23 -18.277 c 0.045 -0.66 0.045 -1.32 0 -1.98 C 73.635 49.855 75.056 47.528 75.011 45 z M 30.011 49.508 c 0 -2.483 2.025 -4.508 4.508 -4.508 c 2.483 0 4.508 2.025 4.508 4.508 s -2.025 4.508 -4.508 4.508 C 32.025 53.993 30.011 51.991 30.011 49.508 z M 56.152 62.058 v -0.179 c -3.199 2.405 -7.114 3.635 -11.119 3.468 c -4.005 0.168 -7.919 -1.063 -11.119 -3.468 c -0.425 -0.515 -0.347 -1.286 0.168 -1.711 c 0.447 -0.369 1.085 -0.369 1.544 0 c 2.707 1.98 6.007 2.987 9.362 2.83 c 3.356 0.179 6.667 -0.783 9.407 -2.74 c 0.492 -0.481 1.297 -0.47 1.779 0.022 C 56.655 60.772 56.644 61.577 56.152 62.058 z M 55.537 54.34 c -0.078 0 -0.145 0 -0.224 0 l 0.034 -0.168 c -2.483 0 -4.508 -2.025 -4.508 -4.508 s 2.025 -4.508 4.508 -4.508 s 4.508 2.025 4.508 4.508 C 59.955 52.148 58.02 54.239 55.537 54.34 z"
                    style={{
                      stroke: "none",
                      strokeWidth: 1,
                      strokeDasharray: "none",
                      strokeLinecap: "butt",
                      strokeLinejoin: "miter",
                      strokeMiterlimit: 10,
                      fill: "rgb(255,255,255)",
                      fillRule: "nonzero",
                      opacity: 1,
                    }}
                    transform=" matrix(1 0 0 1 0 0) "
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>

            <h3 className="font-bold text-xl mb-2">
              Reddit Validation Example
            </h3>

            <p className="text-gray-700 mb-4 flex-grow">
              See a sample of insights you&apos;d get from testing your idea
              within targeted Reddit communities.
            </p>

            <Link
              href="/samples/reddit-validation"
              className="w-full text-center"
            >
              View Sample Report
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-primary/5 w-full py-12 lg:py-20">
        <TestimonialsSection />
      </section>

      <section className="max-w-7xl mx-auto w-full py-12 lg:py-20 px-4 md:px-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Answers to common questions about FounderSignal and validating your
            ideas.
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

      <section className="bg-primary/5 w-full py-12 lg:py-20">
        <div className="max-w-5xl mx-auto text-center px-4 md:px-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Confidently Launch Your Next Big Idea?
          </h2>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Stop building in the dark. Start validating with real data and user
            feedback in just 72 hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <CustomLink href="/submit">
              Start Your Free Validation Today!
            </CustomLink>
          </div>

          <p className="mt-6 text-gray-500">
            No credit card required to get started • Risk-free 3-day validation
          </p>
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </main>
  );
}

function TestimonialsSection() {
  return (
    <div className="max-w-7xl mx-auto px-4 md:px-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Trusted by Founders Like You
        </h2>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          See what early adopters are saying about their experience.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {testimonials.map((testimonial, index) => {
          if (testimonial.type === "tweet") {
            return (
              <Link
                href={testimonial.url}
                key={index}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <OptimizedImage
                        src={testimonial.avatar}
                        alt={testimonial.author}
                        width={48}
                        height={48}
                        className="rounded-full mr-4"
                      />
                      <div>
                        <p className="font-bold">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">
                          {testimonial.handle}
                        </p>
                      </div>
                    </div>
                    <TwitterIcon />
                  </div>
                  <div className="flex-grow text-gray-800">
                    <p>{testimonial.content}</p>
                  </div>
                </div>
              </Link>
            );
          }

          if (testimonial.type === "text") {
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <OptimizedImage
                      src={testimonial.avatar}
                      alt={testimonial.author}
                      width={48}
                      height={48}
                      className="rounded-full mr-4"
                    />
                    <div>
                      <p className="font-bold">{testimonial.author}</p>
                      <p className="text-sm text-gray-500">
                        {testimonial.handle}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex-grow text-gray-700">
                  {testimonial.content}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
