import { redirect } from "next/navigation";
import { getSession as getAuthSession } from "@/lib/auth-guard";

export default async function RootPage() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}
