import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export interface Session {
  user: {
    id: string;
    username: string;
    nama: string;
    role: "ADMIN" | "GURU";
  };
}

export async function getSession(): Promise<Session | null> {
  const session = await auth();
  if (!session || !session.user) {
    return null;
  }
  return {
    user: {
      id: (session.user as any).id,
      username: session.user.email ?? "",
      nama: session.user.name ?? "",
      role: (session.user as any).role ?? "GURU",
    },
  };
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}
