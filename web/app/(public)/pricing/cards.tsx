import { Link } from "@/components/ui/link";
import { Separator } from "@/components/ui/separator";
import { FeaturesList } from "./features";
import { PriceAmount } from "./price-amount";
import { PriceTitle } from "./price-title";

import { IBillingFrequency } from "@/constants/billing-frequency";
import { PricingTier } from "@/constants/pricing-tier";
import { cn } from "@/lib/utils";

interface Props {
  loading: boolean;
  frequency: IBillingFrequency;
  priceMap: Record<string, string>;
}

export function PriceCards({ loading, frequency, priceMap }: Props) {
  return (
    <div className="isolate mx-auto grid grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
      {PricingTier.map((tier) => (
        <div
          key={tier.id}
          className={cn(
            "rounded-lg bg-background/70 backdrop-blur-[6px] overflow-hidden"
          )}
        >
          <div
            className={cn(
              "flex gap-5 flex-col rounded-lg rounded-b-none pricing-card-border"
            )}
          >
            {tier.featured && <FeaturedCardGradient />}

            <PriceTitle tier={tier} />

            <PriceAmount
              loading={loading}
              tier={tier}
              priceMap={priceMap}
              value={frequency.value}
              priceSuffix={frequency.priceSuffix}
            />

            <div className={"px-8"}>
              <Separator className={"bg-border"} />
            </div>

            <div className={"px-8 text-[16px] leading-[24px]"}>
              {tier.description}
            </div>
          </div>

          <div className={"px-8 mt-8"}>
            <Link
              href={
                tier.id !== "starter"
                  ? `/checkout/${tier.priceId[frequency.value]}`
                  : "/dashboard"
              }
              className="w-full"
            >
              Get started
            </Link>
          </div>

          <FeaturesList tier={tier} />
        </div>
      ))}
    </div>
  );
}

const FeaturedCardGradient = () => {
  return (
    <>
      <div className={"featured-yellow-highlight-bg"} />
      <div className={"featured-hard-blur-bg"} />
      <div className={"featured-vertical-hard-blur-bg"} />
      <div className={"featured-soft-blur-bg"} />
    </>
  );
};
