import { paddle } from "@/lib/paddle";

export const openCheckout = async (
  priceId: string,
  applyDiscount: boolean,
  user: {
    id?: string;
    email?: string;
  }
) => {
  if (!user.id) {
    return;
  }

  await paddle
    .then((p) => {
      if (!p) {
        return;
      }

      p.Checkout.open({
        settings: {
          displayMode: "overlay",
          locale: "en",
          successUrl: process.env.NEXT_PUBLIC_APP_URL + "/checkout/success",
          allowLogout: false,
        },
        items: [
          {
            priceId,
            quantity: 1,
          },
        ],
        discountId: applyDiscount
          ? process.env.NEXT_PUBLIC_PADDLE_DISCOUNT_ID
          : null,
        customData: {
          userId: user.id,
          userEmail: user.email,
        },
      });
    })
    .catch(console.error);
};
