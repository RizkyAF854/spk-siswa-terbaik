import { requireAdmin } from "@/lib/auth-guard";
import { getCalculationData, getTahunAjarans } from "@/actions/perhitungan";
import { getClasses } from "@/actions/penilaian";
import { calculateWP } from "@/lib/weighted-product";
import PerhitunganClient from "./PerhitunganClient";
import type { StudentWithAssessments } from "@/types";
import { TAHUN_AJARAN_AKTIF } from "@/lib/constants";

export default async function CalculationPage({
  searchParams,
}: {
  searchParams: Promise<{ tahunAjaran?: string; kelas?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;

  const tahunAjaran = params.tahunAjaran || TAHUN_AJARAN_AKTIF;
  const kelas = params.kelas || "all";

  const [{ students, criterias }, tahunAjarans, classes] = await Promise.all([
    getCalculationData(tahunAjaran, kelas),
    getTahunAjarans(),
    getClasses(),
  ]);

  // Calculate WP results for display
  const completeStudents = students.filter(
    (s) => s.assessments.length === criterias.length
  ) as StudentWithAssessments[];

  const initialResults = completeStudents.length > 0
    ? calculateWP(completeStudents, criterias as any)
    : [];

  return (
    <PerhitunganClient
      students={students as any}
      criterias={criterias as any}
      tahunAjarans={tahunAjarans}
      classes={classes}
      selectedTahunAjaran={tahunAjaran}
      selectedClass={kelas}
      initialResults={initialResults}
      userRole={session.user.role}
    />
  );
}
