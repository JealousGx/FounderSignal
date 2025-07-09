import NextTopLoader from "nextjs-toploader";

export const TopLoader = () => {
  return (
    <NextTopLoader
      showSpinner={false}
      color="var(--primary)"
      height={2}
      shadow="0 0 10px var(--primary)"
      crawlSpeed={100}
      speed={100}
      easing="ease-in-out"
    />
  );
};
