import {
  LayoutDashboard,
  Users,
  Sliders,
  FileSpreadsheet,
  Calculator,
  Award,
  TrendingUp,
  UserCog,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";

export interface MenuItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: ("ADMIN" | "GURU")[];
}

export const menuItems: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["ADMIN", "GURU"] },
  { label: "Data Siswa", href: "/siswa", icon: Users, roles: ["ADMIN", "GURU"] },
  { label: "Data Kriteria", href: "/kriteria", icon: Sliders, roles: ["ADMIN"] },
  { label: "Data Penilaian", href: "/penilaian", icon: FileSpreadsheet, roles: ["ADMIN", "GURU"] },
  { label: "Perhitungan WP", href: "/perhitungan", icon: Calculator, roles: ["ADMIN"] },
  { label: "Hasil Ranking", href: "/ranking", icon: Award, roles: ["ADMIN"] },
  { label: "Laporan", href: "/laporan", icon: TrendingUp, roles: ["ADMIN"] },
  { label: "Pengguna", href: "/pengguna", icon: UserCog, roles: ["ADMIN"] },
  { label: "Profil", href: "/profil", icon: UserIcon, roles: ["ADMIN", "GURU"] },
];

/**
 * Filter menu items based on the user's role
 */
export function getAllowedMenuItems(role: "ADMIN" | "GURU"): MenuItem[] {
  return menuItems.filter((item) => item.roles.includes(role));
}

/**
 * Verify whether a pathname is allowed for a given role
 */
export function isRouteAllowed(role: "ADMIN" | "GURU", pathname: string): boolean {
  // If role is ADMIN, everything is allowed
  if (role === "ADMIN") return true;

  const allowedItems = getAllowedMenuItems(role);
  return allowedItems.some((item) => {
    if (item.href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/";
    }
    // Check if the current pathname starts with the allowed item route
    return pathname.startsWith(item.href);
  });
}
