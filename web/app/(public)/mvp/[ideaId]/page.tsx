import { Suspense } from "react";

import { Link } from "@/components/ui/link";
import { getMVP } from "./action";
import { MVP } from "./mvp";

export const revalidate = 3600;

export default async function MVPPage({
  params,
}: {
  params: Promise<{ ideaId: string }>;
}) {
  const { ideaId } = await params;
  const mvp = await getMVP(ideaId);

  if (!mvp || !mvp.htmlContent) {
    // You could redirect or show a more user-friendly error page
    // notFound();
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontFamily: "sans-serif",
        }}
      >
        <h1>MVP Not Found</h1>
        <p>
          The requested Minimum Viable Product page could not be loaded. It
          might have been moved or deleted.
        </p>
        <Link href="/explore" style={{ textDecoration: "none" }}>
          Explore other ideas
        </Link>
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {mvp && <MVP htmlContent={mvp.htmlContent} ideaId={ideaId} />}
    </Suspense>
  );
}
