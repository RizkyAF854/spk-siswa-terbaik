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
  X,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getAllowedMenuItems } from "@/lib/menu-config";
import { signOut } from "next-auth/react";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRole: "ADMIN" | "GURU";
  userName: string;
}

export function MobileNav({ open, onOpenChange, userRole, userName }: MobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const filteredMenuItems = getAllowedMenuItems(userRole);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed top-0 left-0 w-80 max-w-[85vw] h-full rounded-none border-r border-slate-800 bg-slate-900 text-white p-0 flex flex-col transition-all">
        {/* Header mobile nav */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
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
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon className={cn("h-4.5 w-4.5", isActive ? "text-white" : "text-slate-500")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer profile info & logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-slate-800 h-9 w-9 rounded-full flex items-center justify-center font-semibold text-sm text-slate-300 border border-slate-700">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-200 truncate">{userName}</p>
              <p className="text-xs text-slate-500 font-medium capitalize">
                {userRole.toLowerCase()}
              </p>
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
      </DialogContent>
    </Dialog>
  );
}
