"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Calendar, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { TAHUN_AJARAN_AKTIF } from "@/lib/constants";

interface HeaderProps {
  userRole: "ADMIN" | "GURU";
  userName: string;
}

export function Header({ userRole, userName }: HeaderProps) {
  const pathname = usePathname();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Initialize theme from HTML class or localStorage
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  // Convert pathname to title breadcrumb
  const getBreadcrumbTitle = () => {
    const path = pathname.split("/").filter(Boolean)[0] || "";
    switch (path) {
      case "dashboard":
        return "Dashboard Analytics";
      case "siswa":
        return "Manajemen Data Siswa";
      case "kriteria":
        return "Manajemen Kriteria Penilaian";
      case "penilaian":
        return "Input Penilaian Siswa";
      case "perhitungan":
        return "Perhitungan Weighted Product (WP)";
      case "ranking":
        return "Hasil Perankingan Siswa Terbaik";
      case "laporan":
        return "Laporan & Cetak Hasil SPK";
      case "pengguna":
        return "Manajemen Pengguna Aplikasi";
      case "profil":
        return "Profil Saya";
      default:
        return "Sistem Pendukung Keputusan";
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-zinc-200 dark:bg-zinc-950 dark:border-zinc-800 shrink-0">
      {/* Left side: Breadcrumb / Page Title & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon-xs"
          className="md:hidden"
          onClick={() => setIsMobileNavOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
          {getBreadcrumbTitle()}
        </h2>
      </div>

      {/* Right side: Academic Year, Theme Toggle, User Indicator */}
      <div className="flex items-center gap-4">
        {/* Active Academic Year */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold dark:bg-blue-950/20 dark:border-blue-900/30 dark:text-blue-400">
          <Calendar className="h-3.5 w-3.5" />
          <span>T.A. {TAHUN_AJARAN_AKTIF}</span>
        </div>

        {/* Theme Toggle */}
        <Button variant="ghost" size="icon-xs" onClick={toggleTheme}>
          {isDarkMode ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-zinc-500" />
          )}
        </Button>

        {/* Profile Circle */}
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-900/50 flex items-center justify-center font-bold text-xs uppercase">
            {userName.charAt(0)}
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      <MobileNav
        open={isMobileNavOpen}
        onOpenChange={setIsMobileNavOpen}
        userRole={userRole}
        userName={userName}
      />
    </header>
  );
}
