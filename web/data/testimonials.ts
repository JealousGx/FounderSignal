export const testimonials: {
  type: "tweet" | "text";
  author: string;
  handle: string;
  avatar: string;
  content: string;
  url?: string;
}[] = [
  {
    type: "tweet",
    author: "C_Sonnier",
    handle: "@C_Sonnier",
    avatar: "/assets/testimonials/c_sonnier-avatar.webp",
    content:
      "Tried @FounderSignal—love how you pull real-time Reddit vibes, early sign-ups, and market signals into one slick dashboard. Perfect boost for founders gut-checking an idea. Excited to see it take off! 🚀 ",
    url: "https://x.com/c_sonnier/status/1951279310020440324",
  },
  {
    type: "text",
    author: "Ignacio Aguilar",
    handle: "Early Adopter",
    avatar: "/assets/testimonials/ignacio-aguilar-avatar.webp",
    content:
      "I was blown away by how much time FounderSignal saved me. The process I used to dread now takes a fraction of the time, and the results are consistently better. It's an indispensable tool in my workflow.",
  },
];
