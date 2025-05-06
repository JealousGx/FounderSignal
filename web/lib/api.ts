import { AudienceMember, AudienceStats } from "@/types/audience";
import { Idea } from "@/types/idea";
import { Report } from "@/types/report";

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

export async function getIdeaById(id: string): Promise<Idea | null> {
  const ideas = await getUserIdeas(id);
  return ideas.find((idea) => idea.id === id) || null;
}

export async function getUserIdeas(userId: string): Promise<Idea[]> {
  // This would be an API call in a real app
  return [
    {
      id: "idea-1",
      userId,
      title: "EcoTrack",
      description:
        "An app that helps consumers track their carbon footprint across daily activities and purchases with personalized recommendations for reducing environmental impact.",
      status: "Active",
      stage: "Validation",
      signups: 183,
      targetSignups: 300,
      views: 458,
      engagementRate: 72,
      createdAt: "2023-10-15T14:32:00Z",
      updatedAt: "2023-10-20T09:15:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "idea-2",
      userId,
      title: "RemoteTeamOS",
      description:
        "All-in-one platform for remote teams with project management tools, virtual watercooler and automated check-ins to build culture across time zones.",
      status: "Completed",
      stage: "MVP",
      signups: 427,
      targetSignups: 650,
      views: 1203,
      engagementRate: 81,
      createdAt: "2023-09-28T16:20:00Z",
      updatedAt: "2023-10-18T11:42:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "idea-3",
      userId,
      title: "SkillSwap",
      description:
        "Peer-to-peer platform where professionals can exchange skills and knowledge through 1:1 virtual sessions.",
      status: "Paused",
      stage: "Validation",
      signups: 91,
      targetSignups: 250,
      views: 245,
      engagementRate: 43,
      createdAt: "2023-10-03T09:15:00Z",
      updatedAt: "2023-10-12T14:30:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "idea-4",
      userId,
      title: "HealthHub",
      description:
        "A personalized health tracking app that integrates with wearables and provides AI-driven insights to improve wellness outcomes.",
      status: "Draft",
      stage: "Ideation",
      signups: 0,
      targetSignups: 100,
      views: 0,
      engagementRate: 0,
      createdAt: "2023-10-22T10:45:00Z",
      updatedAt: "2023-10-22T10:45:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=200&auto=format&fit=crop",
    },
    {
      id: "idea-5",
      userId,
      title: "LocalFresh",
      description:
        "Marketplace connecting consumers directly to local farmers and food producers for fresher ingredients and supporting local agriculture.",
      status: "Active",
      stage: "MVP",
      signups: 214,
      targetSignups: 100,
      views: 680,
      engagementRate: 67,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-10-19T16:25:00Z",
      imageUrl:
        "https://images.unsplash.com/photo-1474440692490-2e83ae13ba29?q=80&w=200&auto=format&fit=crop",
    },
  ];
}

export async function getUserReports(userId: string): Promise<Report[]> {
  // This would be an API call in a real app
  // For now, we'll return mock data
  return [
    {
      id: "report-1",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      date: "2023-10-28T09:00:00Z",
      type: "Weekly",
      views: 458,
      signups: 183,
      conversionRate: 39.9,
      validated: true,
      sentiment: 0.87,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
    {
      id: "report-2",
      ideaId: "idea-2",
      idea: {
        title: "RemoteTeamOS",
      },
      date: "2023-10-21T15:30:00Z",
      type: "Monthly",
      views: 1203,
      signups: 427,
      conversionRate: 35.5,
      validated: true,
      sentiment: 0.92,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
    {
      id: "report-3",
      ideaId: "idea-3",
      idea: {
        title: "SkillSwap",
      },
      date: "2023-10-14T11:15:00Z",
      type: "Weekly",
      views: 245,
      signups: 91,
      conversionRate: 37.1,
      validated: false,
      sentiment: 0.76,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
    {
      id: "report-4",
      ideaId: "idea-5",
      idea: {
        title: "LocalFresh",
      },
      date: "2023-10-07T16:45:00Z",
      type: "Milestone",
      views: 680,
      signups: 214,
      conversionRate: 31.5,
      validated: true,
      sentiment: 0.81,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
    {
      id: "report-5",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      date: "2023-09-30T10:30:00Z",
      type: "Weekly",
      views: 352,
      signups: 127,
      conversionRate: 36.1,
      validated: false,
      sentiment: 0.72,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
    {
      id: "report-6",
      ideaId: "idea-2",
      idea: {
        title: "RemoteTeamOS",
      },
      date: "2023-09-23T14:00:00Z",
      type: "Final",
      views: 982,
      signups: 335,
      conversionRate: 34.1,
      validated: true,
      sentiment: 0.89,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
    {
      id: "report-7",
      ideaId: "idea-3",
      idea: {
        title: "SkillSwap",
      },
      date: "2023-09-16T09:15:00Z",
      type: "Weekly",
      views: 198,
      signups: 67,
      conversionRate: 33.8,
      validated: false,
      sentiment: 0.65,
      createdAt: "2023-09-12T13:20:00Z",
      updatedAt: "2023-09-12T13:20:00Z",
    },
  ];
}

export async function getReportById(id: string): Promise<Report | null> {
  const reports = await getUserReports("user_123");
  return reports.find((report) => report.id === id) || null;
}
export async function getAudienceStats(userId: string): Promise<AudienceStats> {
  // This would be an API call in a real app
  // For now, we'll return mock data
  return {
    totalSubscribers: 823,
    newSubscribers: 127,
    newSubscribersChange: 12, // percent change compared to previous period
    averageConversionRate: 32.5,
    conversionRateChange: -2.3, // percent change compared to previous period
    totalIdeas: 5,
  } as AudienceStats;
}

export async function getAudienceMembers(userId: string) {
  // This would be an API call in a real app
  // For now, we'll return mock data
  return [
    {
      id: "sub_1",
      email: "sarah.johnson@example.com",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      signupTime: "2023-04-22T14:32:00Z",
    },
    {
      id: "sub_2",
      email: "michael.smith@example.com",
      ideaId: "idea-2",
      idea: {
        title: "RemoteTeamOS",
      },
      signupTime: "2023-04-21T10:15:00Z",
    },
    {
      id: "sub_3",
      email: "emily.davis@example.com",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      signupTime: "2023-04-21T12:45:00Z",
    },
    {
      id: "sub_4",
      email: "david.wilson@example.com",
      ideaId: "idea-3",
      idea: {
        title: "SkillSwap",
      },
      signupTime: "2023-04-20T08:30:00Z",
    },
    {
      id: "sub_5",
      email: "jennifer.brown@example.com",
      ideaId: "idea-2",
      idea: {
        title: "RemoteTeamOS",
      },
      signupTime: "2023-04-19T14:05:00Z",
    },
    {
      id: "sub_6",
      email: "robert.thompson@example.com",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      signupTime: "2023-04-19T11:37:00Z",
    },
    {
      id: "sub_7",
      email: "lisa.garcia@example.com",
      ideaId: "idea-3",
      idea: {
        title: "SkillSwap",
      },
      signupTime: "2023-04-18T16:20:00Z",
    },
    {
      id: "sub_8",
      email: "james.martinez@example.com",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      signupTime: "2023-04-18T10:45:00Z",
    },
    {
      id: "sub_9",
      email: "linda.rodriguez@example.com",
      ideaId: "idea-2",
      idea: {
        title: "RemoteTeamOS",
      },
      signupTime: "2023-04-17T15:30:00Z",
    },
    {
      id: "sub_10",
      email: "william.lee@example.com",
      ideaId: "idea-3",
      idea: {
        title: "SkillSwap",
      },
      signupTime: "2023-04-17T09:15:00Z",
    },
    {
      id: "sub_11",
      email: "karen.walker@example.com",
      ideaId: "idea-1",
      idea: {
        title: "EcoTrack",
      },
      signupTime: "2023-04-16T16:50:00Z",
    },
    {
      id: "sub_12",
      email: "richard.hall@example.com",
      ideaId: "idea-2",
      idea: {
        title: "RemoteTeamOS",
      },
      signupTime: "2023-04-16T11:25:00Z",
    },
  ] as AudienceMember[];
}

export async function getUserSettings(userId: string) {
  // This would be an API call in a real app
  // For now, we'll return mock data
  return {
    profile: {
      title: "Founder & Product Manager",
      location: "San Francisco, CA",
      bio: "Building the next generation of tools for founders and early-stage startups. Passionate about product development and user experience.",
      company: "FounderSignal",
      website: "https://foundersignal.io",
    },
    notifications: {
      email_marketing: true,
      email_updates: true,
      email_validation: true,
      browser_push: false,
      weekly_summary: true,
      idea_comments: true,
    },
    integrations: {
      google_analytics: {
        connected: true,
        connectedAt: "2023-01-15T09:24:00Z",
      },
      mailchimp: {
        connected: false,
      },
      stripe: {
        connected: true,
        connectedAt: "2023-02-10T14:30:00Z",
      },
      zapier: {
        connected: false,
      },
    },
    appearance: {
      theme: "system",
      densityMode: "comfortable",
      animations: true,
    },
  };
}

export async function updateUserSettings(userId: string, settings: any) {
  // This would update settings via an API call in a real app
  console.log("Settings updated:", settings);
  return { success: true };
}
