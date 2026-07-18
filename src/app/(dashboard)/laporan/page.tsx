import { requireAdmin } from "@/lib/auth-guard";
import { getCalculationData, getRankings, getTahunAjarans } from "@/actions/perhitungan";
import { getClasses } from "@/actions/penilaian";
import LaporanClient from "./LaporanClient";
import { TAHUN_AJARAN_AKTIF } from "@/lib/constants";

export default async function ReportPage({
  searchParams,
}: {
  searchParams: Promise<{ jenis?: string; tahunAjaran?: string; kelas?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  const jenis = (params.jenis === "penilaian" ? "penilaian" : "ranking") as "penilaian" | "ranking";
  const tahunAjaran = params.tahunAjaran || TAHUN_AJARAN_AKTIF;
  const kelas = params.kelas || "all";

  const [{ students, criterias }, dbRankings, tahunAjarans, classes] = await Promise.all([
    getCalculationData(tahunAjaran, kelas),
    getRankings(tahunAjaran, kelas),
    getTahunAjarans(),
    getClasses(),
  ]);

  const mappedRankings = dbRankings.map((r) => ({
    ranking: r.ranking,
    nis: r.student.nis,
    nama: r.student.nama,
    kelas: r.student.kelas,
    nilaiS: r.nilaiS,
    nilaiV: r.nilaiV,
    status: r.status,
  }));

  return (
    <LaporanClient
      students={students as any}
      criterias={criterias as any}
      rankings={mappedRankings}
      tahunAjarans={tahunAjarans}
      classes={classes}
      selectedTahunAjaran={tahunAjaran}
      selectedClass={kelas}
      selectedJenis={jenis}
      userRole={session.user.role}
    />
  );
}
