"use client";

import { Paddle } from "@paddle/paddle-js";
import { useEffect, useState } from "react";

import { PriceCards } from "./cards";
import { CountryDropdown } from "./country-dropdown";
import { Toggle } from "./toggle";

import {
  BillingFrequency,
  IBillingFrequency,
} from "@/constants/billing-frequency";
import { usePaddlePrices } from "@/hooks/usePaddlePrices";
import { paddle } from "@/lib/paddle";

export const PricingSection = () => {
  const [frequency, setFrequency] = useState<IBillingFrequency>(
    BillingFrequency[0]
  );
  const [p, setPaddle] = useState<Paddle | undefined>(undefined);
  const [country, setCountry] = useState<string>("US");

  const { prices, loading } = usePaddlePrices(p, country);

  useEffect(() => {
    if (
      process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN &&
      process.env.NEXT_PUBLIC_PADDLE_ENV
    ) {
      paddle.then((_p) => {
        if (_p) {
          setPaddle(_p);
        }
      });
    }
  }, []);

  return (
    <section className="mx-auto max-w-7xl relative px-[32px] flex flex-col items-center justify-between">
      <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mb-10 md:mb-12">
        <Toggle frequency={frequency} setFrequency={setFrequency} />

        <CountryDropdown country={country} onCountryChange={setCountry} />
      </div>

      <PriceCards frequency={frequency} loading={loading} priceMap={prices} />
    </section>
  );
};
