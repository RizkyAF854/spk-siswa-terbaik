import { requireAdmin } from "@/lib/auth-guard";
import { getCriterias } from "@/actions/kriteria";
import KriteriaClient from "./KriteriaClient";

export default async function KriteriaPage() {
  const session = await requireAdmin();
  const criterias = await getCriterias();

  return <KriteriaClient criterias={criterias as any} userRole={session.user.role} />;
}
