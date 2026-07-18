import { requireAdmin } from "@/lib/auth-guard";
import { getUsers } from "@/actions/user";
import PenggunaClient from "./PenggunaClient";

export default async function UserPage() {
  const session = await requireAdmin();
  const users = await getUsers();

  return <PenggunaClient users={users as any} currentUserId={session.user.id} />;
}
