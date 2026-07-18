import { requireAuth } from "@/lib/auth-guard";
import ProfilClient from "./ProfilClient";

export default async function ProfilePage() {
  const session = await requireAuth();

  const profile = {
    id: session.user.id,
    username: session.user.username,
    nama: session.user.nama,
    role: session.user.role,
  };

  return <ProfilClient profile={profile} />;
}
