import { requireAuth } from "@/lib/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DashboardProviders } from "@/components/layout/dashboard-providers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Enforce authentication server-side before rendering
  const session = await requireAuth();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar - Desktop Only */}
      <Sidebar userRole={session.user.role} userName={session.user.nama} />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header - Page Title & Actions */}
        <Header userRole={session.user.role} userName={session.user.nama} />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl space-y-6">
            <DashboardProviders session={session}>{children}</DashboardProviders>
          </div>
        </main>
      </div>
    </div>
  );
}

