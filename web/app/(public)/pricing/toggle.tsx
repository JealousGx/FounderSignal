import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BillingFrequency,
  IBillingFrequency,
} from "@/constants/billing-frequency";
import { cn } from "@/lib/utils";

interface Props {
  frequency: IBillingFrequency;
  setFrequency: (frequency: IBillingFrequency) => void;
}

export function Toggle({ setFrequency, frequency }: Props) {
  const isFirstTabActive = frequency.value === BillingFrequency[0].value;

  return (
    <div className="flex justify-center">
      <Tabs
        value={frequency.value}
        onValueChange={(value) =>
          setFrequency(
            BillingFrequency.find(
              (billingFrequency) => value === billingFrequency.value
            )!
          )
        }
        className="w-auto"
      >
        <TabsList className="relative grid w-full grid-cols-2 bg-gray-200 p-1 rounded-lg h-12">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-1 bottom-1 left-1 rounded-md bg-white shadow-sm transition-transform duration-300 ease-in-out",
              "w-[calc(50%-0.25rem)]",
              {
                "translate-x-0": isFirstTabActive,
                "translate-x-full": !isFirstTabActive,
              }
            )}
          />
          {BillingFrequency.map((billingFrequency) => (
            <TabsTrigger
              key={billingFrequency.value}
              value={billingFrequency.value}
              className="relative z-10 px-6 py-2.5 text-base font-medium leading-5 text-gray-700 rounded-md data-[state=active]:text-gray-900 focus:outline-none transition-colors duration-300 ease-in-out"
            >
              {billingFrequency.label}

              {billingFrequency.value === "year" && (
                <span className="ml-1 text-xs text-primary font-semibold">
                  20% off
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  );
}
