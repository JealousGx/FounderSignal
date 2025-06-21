import { Skeleton } from "@/components/ui/skeleton";
import { Tier } from "@/constants/pricing-tier";
import { cn } from "@/lib/utils";

interface Props {
  loading: boolean;
  tier: Tier;
  priceMap: Record<string, string>;
  value: string;
  priceSuffix: string;
}

export function PriceAmount({
  loading,
  priceMap,
  priceSuffix,
  tier,
  value,
}: Props) {
  return (
    <div className="flex items-end px-8">
      {loading ? (
        <Skeleton className="h-[96px] w-full bg-border" />
      ) : (
        <>
          <span
            className={cn(
              "text-[60px] leading-[82px] tracking-[-1.6px] font-medium"
            )}
          >
            {priceMap[tier.priceId[value]].replace(/\.00$/, "")}
          </span>

          <span
            className={cn("font-medium text-end leading-[12px] text-[12px]")}
          >
            {priceSuffix}
          </span>
        </>
      )}
    </div>
  );
}
