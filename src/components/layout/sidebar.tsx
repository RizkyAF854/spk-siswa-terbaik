"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getAllowedMenuItems } from "@/lib/menu-config";
import { signOut } from "next-auth/react";

interface SidebarProps {
  userRole: "ADMIN" | "GURU";
  userName: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredMenuItems = getAllowedMenuItems(userRole);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 bg-slate-950/50">
        <div className="bg-blue-600 p-2 rounded-lg text-white">
          <GraduationCap className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-bold text-xs leading-tight text-slate-100">SMK Karya Guna<br/>Bhakti 2</h1>
            <span className="text-[9px] text-blue-400 font-semibold tracking-wider uppercase">
            SPK Siswa Terbaik
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors group",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-400"
                )}
              />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer User Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-slate-800 h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm text-slate-300 border border-slate-700">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
            <p className="text-xs text-slate-500 font-medium capitalize">{userRole.toLowerCase()}</p>
          </div>
        </div>
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="w-full justify-start text-xs font-medium text-rose-400 hover:text-rose-100 bg-transparent border border-rose-950/40 hover:bg-rose-950/20 py-2 h-auto"
        >
          <LogOut className="mr-2 h-3.5 w-3.5" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
