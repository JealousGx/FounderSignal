import {
  FileText,
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

export const NavItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Ideas",
    href: "/dashboard/ideas",
    icon: Sparkles,
  },
  {
    name: "Reddit Validation",
    href: "/dashboard/reddit-validations",
    icon: TrendingUp,
  },
  {
    name: "Validation Reports",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    name: "Audience",
    href: "/dashboard/audience",
    icon: Users,
  },
];
