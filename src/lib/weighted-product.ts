import type {
  WPResult,
  CriteriaWithBobot,
  StudentWithAssessments,
  Student,
  StudentAssessment,
  Criteria,
  NormalisasiBobot,
  VektorS,
  VektorV,
  RankingWithStudent,
  RankingStatus,
  TipeKriteria,
} from "@/types";
import { getScoreForCriteria } from "@/lib/constants";

// ─── Server-side helpers (used by API routes / server actions) ─

export function normalizeWeights(
  criterias: { id: string; kode: string; nama: string; bobot: number; tipe: TipeKriteria }[]
): CriteriaWithBobot[] {
  const totalBobot = criterias.reduce((sum, c) => sum + c.bobot, 0);
  return criterias.map((c) => ({
    ...c,
    normalizedBobot: c.tipe === "BENEFIT" ? c.bobot / totalBobot : -(c.bobot / totalBobot),
  }));
}

export function calculateVectorS(
  students: StudentWithAssessments[],
  normalizedCriterias: CriteriaWithBobot[]
): { studentId: string; nilaiS: number; details: WPResult["details"] }[] {
  return students.map((student) => {
    let nilaiS = 1;
    const details: WPResult["details"] = [];

    normalizedCriterias.forEach((criteria) => {
      const assessment = student.assessments.find(
        (a) => a.criteriaId === criteria.id
      );
      const nilai = assessment ? assessment.nilai : 0;
      const pangkat = Math.pow(nilai, criteria.normalizedBobot);
      nilaiS *= pangkat;

      details.push({
        criteriaName: criteria.nama,
        nilai,
        bobot: criteria.bobot,
        normalizedBobot: criteria.normalizedBobot,
        pangkat,
      });
    });

    return { studentId: student.id, nilaiS, details };
  });
}

export function calculateVectorV(
  vectorSResults: { studentId: string; nilaiS: number }[]
): { studentId: string; nilaiV: number }[] {
  const totalS = vectorSResults.reduce((sum, r) => sum + r.nilaiS, 0);
  return vectorSResults.map((r) => ({
    studentId: r.studentId,
    nilaiV: totalS > 0 ? r.nilaiS / totalS : 0,
  }));
}

export function assignStatus(ranking: number): string {
  if (ranking === 1) return "Siswa Terbaik";
  if (ranking <= 3) return "Sangat Baik";
  return "Baik";
}

export function calculateWP(
  students: StudentWithAssessments[],
  criterias: { id: string; kode: string; nama: string; bobot: number; tipe: TipeKriteria }[]
): WPResult[] {
  if (students.length === 0 || criterias.length === 0) return [];

  // Step 1: Normalize weights
  const normalizedCriterias = normalizeWeights(criterias);

  // Step 2: Calculate Vector S
  const vectorSResults = calculateVectorS(students, normalizedCriterias);

  // Step 3: Calculate Vector V
  const vectorVResults = calculateVectorV(vectorSResults);

  // Step 4: Combine and rank
  const results: WPResult[] = students.map((student) => {
    const sResult = vectorSResults.find((r) => r.studentId === student.id)!;
    const vResult = vectorVResults.find((r) => r.studentId === student.id)!;

    return {
      studentId: student.id,
      studentName: student.nama,
      nis: student.nis,
      kelas: student.kelas,
      nilaiS: sResult.nilaiS,
      nilaiV: vResult.nilaiV,
      ranking: 0,
      status: "",
      details: sResult.details,
    };
  });

  // Sort by Vector V descending
  results.sort((a, b) => b.nilaiV - a.nilaiV);

  // Assign ranking and status
  results.forEach((result, index) => {
    result.ranking = index + 1;
    result.status = assignStatus(result.ranking);
  });

  return results;
}

// ─── Client-side reusable WP algorithm ──────────────────────
// Fully dynamic: iterates over ALL criteria passed in, no hardcoded C1–C4.

export function calculateClientWP(
  students: Student[],
  assessments: StudentAssessment[],
  criteria: Criteria[]
): {
  normalisasiBobot: NormalisasiBobot[];
  vektorS: VektorS[];
  vektorV: VektorV[];
  rankings: RankingWithStudent[];
} {
  // Step 1: Normalisasi Bobot — dynamic over all criteria
  const totalBobot = criteria.reduce((sum, c) => sum + c.bobot, 0);
  const normalisasiBobot: NormalisasiBobot[] = criteria.map((c) => {
    const bobotNormalisasi =
      totalBobot > 0
        ? c.tipe === "BENEFIT"
          ? c.bobot / totalBobot
          : -(c.bobot / totalBobot)
        : 0;
    return {
      criteria: c,
      bobotAsli: c.bobot,
      bobotNormalisasi,
    };
  });

  // Step 2: Perhitungan Nilai Vektor S — dynamically iterate criteria
  const vektorS: VektorS[] = assessments.map((a) => {
    const details = normalisasiBobot.map((nb) => {
      const nilai = getScoreForCriteria(a.scores, nb.criteria.kode);
      return {
        criteria: nb.criteria,
        nilai,
        pangkat: nb.bobotNormalisasi,
      };
    });

    // Calculate S_i = Π (X_ij ^ w_j)
    const nilaiS = details.reduce((acc, d) => {
      const val = d.nilai <= 0 ? 1 : d.nilai; // Avoid 0 to prevent math breakage
      return acc * Math.pow(val, d.pangkat);
    }, 1);

    return {
      student: a.student,
      details,
      nilaiS,
    };
  });

  // Step 3: Perhitungan Nilai Vektor V
  const totalS = vektorS.reduce((acc, curr) => acc + curr.nilaiS, 0);
  const vektorV: VektorV[] = vektorS.map((v) => ({
    student: v.student,
    nilaiS: v.nilaiS,
    nilaiV: totalS > 0 ? v.nilaiS / totalS : 0,
  }));

  // Step 4: Hasil Perankingan & Penentuan Status
  const rankings: RankingWithStudent[] = [...vektorV]
    .sort((a, b) => b.nilaiV - a.nilaiV)
    .map((v, i) => {
      const rank = i + 1;
      const status = assignStatus(rank) as RankingStatus;
      return {
        id: `rnk-${v.student.id}`,
        studentId: v.student.id,
        nilaiS: v.nilaiS,
        nilaiV: v.nilaiV,
        ranking: rank,
        tahunAjaran: v.student.tahunAjaran,
        kelas: v.student.kelas,
        status,
        student: v.student,
        createdAt: new Date(),
      };
    });

  return {
    normalisasiBobot,
    vektorS,
    vektorV,
    rankings,
  };
}
