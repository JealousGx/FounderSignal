import { Metadata } from "next";
import { Suspense } from "react";

import { Link } from "@/components/ui/link";
import { getMVP } from "./action";
import { MVP } from "./mvp";

import { createMetadata } from "@/lib/metadata";

type Props = {
  params: Promise<{ ideaId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ideaId } = await params;
  const data = await getMVP(ideaId);

  if (!data?.idea) {
    return {
      title: "Idea Not Found",
    };
  }

  const idea = data.idea;
  const title = `${idea.title}`;
  const description = idea.description;

  return createMetadata({
    title,
    description,
    image: idea.imageUrl,
    urlPath: `mvp/${ideaId}`,
  });
}

export default async function MVPPage({ params }: Props) {
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
      <MVP htmlContent={mvp.htmlContent} ideaId={ideaId} />
    </Suspense>
  );
}
