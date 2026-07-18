import { requireAuth } from "@/lib/auth-guard";
import { getGroupedAssessments } from "@/actions/penilaian";
import { getAllStudents } from "@/actions/siswa";
import { getCriterias } from "@/actions/kriteria";
import PenilaianClient from "./PenilaianClient";

export default async function AssessmentPage() {
  const session = await requireAuth();
  const [assessments, allStudents, criterias] = await Promise.all([
    getGroupedAssessments(),
    getAllStudents(),
    getCriterias(),
  ]);

  return (
    <PenilaianClient
      assessments={assessments as any}
      allStudents={allStudents as any}
      criteria={criterias as any}
      userRole={session.user.role}
    />
  );
}
