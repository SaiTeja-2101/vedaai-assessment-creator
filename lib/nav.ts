import {
  LayoutGrid,
  Images,
  FileText,
  BookOpen,
  PieChart,
  Sparkles,
  Library,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** When false, the link is a visual placeholder (feature not built for this assignment). */
  enabled?: boolean;
};

/** Primary sidebar navigation (desktop). */
export const SIDEBAR_NAV: NavItem[] = [
  { label: "Home", href: "/home", icon: LayoutGrid },
  { label: "My Groups", href: "/groups", icon: Images },
  { label: "Assignments", href: "/assignments", icon: FileText, enabled: true },
  { label: "AI Teacher's Toolkit", href: "/toolkit", icon: BookOpen },
  { label: "My Library", href: "/library", icon: PieChart },
];

/** Bottom tab bar (mobile). */
export const MOBILE_TABS: NavItem[] = [
  { label: "Home", href: "/home", icon: LayoutGrid },
  { label: "Assignments", href: "/assignments", icon: FileText, enabled: true },
  { label: "Library", href: "/library", icon: Library },
  { label: "AI Toolkit", href: "/toolkit", icon: Sparkles },
];
