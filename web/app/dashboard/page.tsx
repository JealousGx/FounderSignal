// web/app/dashboard/page.tsx
import { auth } from "@clerk/nextjs/server";

export default async function Dashboard() {
  const { userId } = await auth();

  if (!userId) return <div>Unauthorized</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Your Ideas</h1>
      {/* We'll add data here later */}
    </div>
  );
}
