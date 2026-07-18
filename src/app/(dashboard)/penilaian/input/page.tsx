import { getCriterias } from "@/actions/kriteria";
import { getStudentAssessments } from "@/actions/penilaian";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import InputPenilaianClient from "./InputPenilaianClient";

export default async function InputPenilaianPage({
  searchParams,
}: {
  searchParams: Promise<{ studentId?: string }>;
}) {
  const params = await searchParams;
  const studentId = params.studentId;

  if (!studentId) {
    redirect("/penilaian");
  }

  // Fetch student
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    redirect("/penilaian");
  }

  // Fetch all criteria and existing assessments
  const criterias = await getCriterias();
  const existingAssessments = await getStudentAssessments(studentId);

  return (
    <InputPenilaianClient
      student={{
        id: student.id,
        nis: student.nis,
        nama: student.nama,
        kelas: student.kelas,
        jurusan: student.jurusan,
        tahunAjaran: student.tahunAjaran,
      }}
      criterias={criterias.map((c) => ({
        id: c.id,
        kode: c.kode,
        nama: c.nama,
        bobot: c.bobot,
        tipe: c.tipe,
      }))}
      existingAssessments={existingAssessments.map((a) => ({
        criteriaId: a.criteriaId,
        nilai: a.nilai,
      }))}
    />
  );
}
