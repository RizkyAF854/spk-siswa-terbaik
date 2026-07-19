"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { isRouteAllowed } from "@/lib/menu-config";
import type { Session } from "@/lib/auth-guard";

interface DashboardProvidersProps {
  children: React.ReactNode;
  session: Session;
}

export function DashboardProviders({ children, session }: DashboardProvidersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const userRole = session.user.role;

  useEffect(() => {
    if (!isRouteAllowed(userRole, pathname)) {
      router.replace("/dashboard");
    }
  }, [pathname, userRole, router]);

  const allowed = isRouteAllowed(userRole, pathname);

  if (!allowed) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <span className="text-zinc-500 text-sm font-medium">Mengalihkan akses...</span>
      </div>
    );
  }

  return <>{children}</>;
}
