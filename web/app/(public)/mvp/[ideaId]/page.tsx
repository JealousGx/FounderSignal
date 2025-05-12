import { api } from "@/lib/api";
import { cache, Suspense } from "react";
import { MVP } from "./mvp";

const getMVP = cache(async (ideaId: string) => {
  try {
    const response = await api.get(`/ideas/${ideaId}/mvp`, {
      cache: "force-cache",
      next: {
        revalidate: 3600,
        tags: [`mvp-${ideaId}`],
      },
    });

    if (!response.ok) {
      console.error(
        "API error fetching mvp:",
        response.status,
        response.statusText
      );

      return null;
    }

    const data = await response.json();

    return data;
  } catch (error) {
    console.error("Error in getMVP:", error);
    return null;
  }
});

export default async function MVPPage({
  params,
}: {
  params: { ideaId: string };
}) {
  const { ideaId } = await params;
  const mvp = await getMVP(ideaId);

  console.log("MVPPage", ideaId);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {mvp && <MVP htmlContent={mvp.htmlContent} />}
    </Suspense>
  );
}
