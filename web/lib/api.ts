export async function submitIdea(data: {
  title: string;
  description: string;
  targetAudience: string;
  cta: string;
}) {
  const res = await fetch("http://localhost:8080/api/ideas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return await res.json();
}

export async function getIdeas() {
  const res = await fetch("http://localhost:8080/api/ideas", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch ideas");
  }

  return await res.json();
}
