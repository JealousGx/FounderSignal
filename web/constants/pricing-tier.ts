export interface Tier {
  name: string;
  id: "starter" | "pro" | "business";
  icon: string;
  description: string;
  features: string[];
  featured: boolean;
  priceId: Record<string, string>;
}

export const PricingTier: Tier[] = [
  {
    name: "Starter",
    id: "starter",
    icon: "/assets/icons/price-tiers/free-icon.svg",
    description: "Test your first idea with an auto-MVP & basic feedback.",
    features: [
      "Validate your first idea",
      "Auto-generated MVP simulator",
      "Basic interaction tracking (page views, CTA clicks)",
      "Collect direct user comments",
      "Public testing mode",
    ],
    featured: false,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_STARTER_MONTHLY_PRICE_ID!,
      year: process.env.NEXT_PUBLIC_PADDLE_STARTER_YEARLY_PRICE_ID!,
    },
  },
  {
    name: "Pro",
    id: "pro",
    icon: "/assets/icons/price-tiers/basic-icon.svg",
    description: "Deeper insights with custom MVPs & broader audience access.",
    features: [
      "Validate up to 10 ideas simultaneously",
      "Customizable MVP simulators",
      "Advanced interaction tracking (scroll depth, time on page)",
      "Access to general audience testing pool",
      "Private testing mode for confidential ideas",
      "Enhanced analytics dashboard",
    ],
    featured: true,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRO_MONTHLY_PRICE_ID!,
      year: process.env.NEXT_PUBLIC_PADDLE_PRO_YEARLY_PRICE_ID!,
    },
  },
  {
    name: "Business",
    id: "business",
    icon: "/assets/icons/price-tiers/pro-icon.svg",
    description:
      "Extensive validation for teams with AI insights & full analytics.",
    features: [
      "Validate 1,000 ideas",
      "AI-powered feedback summaries & market signal reports",
      "Detailed engagement heatmaps for MVPs",
      "Advanced audience targeting options",
      "Team member access & collaboration tools (To be implemented later)",
      "24/7 Customer Support",
    ],
    featured: false,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_MONTHLY_PRICE_ID!,
      year: process.env.NEXT_PUBLIC_PADDLE_BUSINESS_YEARLY_PRICE_ID!,
    },
  },
];

export const getIdeaLimitByTier = (
  tierId: "starter" | "pro" | "business"
): number => {
  switch (tierId) {
    case "starter":
      return 1;
    case "pro":
      return 10;
    case "business":
      return 1000;
    default:
      return 1; // Default case if tierId is not recognized
  }
};
