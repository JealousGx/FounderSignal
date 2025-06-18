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
      month: "pri_01jxsak6mag9h4zck3qtbfggdb",
      year: "pri_01jxsakjxktpp3pcma1es34ekt",
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
      month: "pri_01jxs1zskp3ak022rvzffz2w9v",
      year: "pri_01jxs25f8xpw1de606r19kh30v",
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
      month: "pri_01jxs21datfz4zvxg5bnww2xna",
      year: "pri_01jxs247senyyv1yc68cvqfmnc",
    },
  },
];
