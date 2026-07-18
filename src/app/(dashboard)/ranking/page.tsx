import { requireAdmin } from "@/lib/auth-guard";
import { getRankings, getTahunAjarans } from "@/actions/perhitungan";
import { getClasses } from "@/actions/penilaian";
import RankingClient from "./RankingClient";
import { TAHUN_AJARAN_AKTIF } from "@/lib/constants";

export default async function RankingPage({
  searchParams,
}: {
  searchParams: Promise<{ tahunAjaran?: string; kelas?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  const tahunAjaran = params.tahunAjaran || TAHUN_AJARAN_AKTIF;
  const kelas = params.kelas || "all";

  const [rankings, tahunAjarans, classes] = await Promise.all([
    getRankings(tahunAjaran, kelas),
    getTahunAjarans(),
    getClasses(),
  ]);

  return (
    <RankingClient
      rankings={rankings as any}
      tahunAjarans={tahunAjarans}
      classes={classes}
      selectedTahunAjaran={tahunAjaran}
      selectedClass={kelas}
      userRole={session.user.role}
    />
  );
}
