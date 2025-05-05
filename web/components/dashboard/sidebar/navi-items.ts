import { FileText, LayoutDashboard, Sparkles, Users } from "lucide-react";

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
