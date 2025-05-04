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

// Mock data function - replace with real API calls later

export async function getTopIdeasForUser(userId: string) {
  // In a real app, fetch from your API
  return [
    {
      id: "idea-1",
      title: "EcoTrack",
      signups: [5, 8, 12, 15, 18, 22, 30],
      views: [45, 62, 78, 105, 125, 140, 180],
      dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    {
      id: "idea-2",
      title: "RemoteTeamOS",
      signups: [12, 14, 16, 18, 16, 20, 25],
      views: [80, 90, 95, 100, 85, 110, 140],
      dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    {
      id: "idea-3",
      title: "SkillSwap",
      signups: [3, 4, 7, 9, 11, 14, 15],
      views: [30, 45, 60, 75, 90, 100, 120],
      dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
  ];
}
