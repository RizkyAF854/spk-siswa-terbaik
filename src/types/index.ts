// Student types
export interface Student {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: "LAKI_LAKI" | "PEREMPUAN";
  kelas: string;
  jurusan: string;
  tahunAjaran: string;
  createdAt: Date;
  updatedAt: Date;
}

// Criteria types
export type TipeKriteria = "BENEFIT" | "COST";

export interface Criteria {
  id: string;
  kode: string;
  nama: string;
  bobot: number;
  tipe: TipeKriteria;
}

export interface CriteriaWithBobot extends Criteria {
  normalizedBobot: number;
}

// Assessment types
export interface Assessment {
  id: string;
  studentId: string;
  criteriaId: string;
  nilai: number;
  student?: Student;
  criteria?: Criteria;
}

export interface AssessmentWithRelations extends Assessment {
  student: Student;
  criteria: Criteria;
}

export interface StudentWithAssessments extends Student {
  assessments: (Assessment & { criteria: Criteria })[];
}

// Aggregated assessment per student (all criteria values in one row)
// Uses a dynamic `scores` map keyed by criteria field name (e.g. "nilaiAkademik", "sikap")
// This makes the system extensible when criteria are added/removed.
export interface StudentAssessment {
  id: string;
  student: Student;
  scores: Record<string, number>;
}

// ─── Convenience accessors (backward-compatible helpers) ─────
// These allow pages to read familiar field names without breaking.
export function getScore(a: StudentAssessment, key: string, fallback = 0): number {
  return a.scores[key] ?? fallback;
}

// Ranking types
export type RankingStatus = "Siswa Terbaik" | "Sangat Baik" | "Baik" | "Cukup Baik" | "Cukup";

export interface Ranking {
  id: string;
  studentId: string;
  nilaiS: number;
  nilaiV: number;
  ranking: number;
  tahunAjaran: string;
  kelas: string;
  status: RankingStatus;
  student?: Student;
  createdAt: Date;
}

export interface RankingWithStudent extends Ranking {
  student: Student;
}

// User types
export type UserRole = "ADMIN" | "GURU";

export interface User {
  id: string;
  username: string;
  nama: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

// WP Calculation types
export interface WPResult {
  studentId: string;
  studentName: string;
  nis: string;
  kelas: string;
  nilaiS: number;
  nilaiV: number;
  ranking: number;
  status: string;
  details: {
    criteriaName: string;
    nilai: number;
    bobot: number;
    normalizedBobot: number;
    pangkat: number;
  }[];
}

export interface NormalisasiBobot {
  criteria: Criteria;
  bobotAsli: number;
  bobotNormalisasi: number;
}

export interface VektorS {
  student: Student;
  details: { criteria: Criteria; nilai: number; pangkat: number }[];
  nilaiS: number;
}

export interface VektorV {
  student: Student;
  nilaiS: number;
  nilaiV: number;
}

export interface HasilPerankingan {
  ranking: number;
  student: Student;
  nilaiS: number;
  nilaiV: number;
  status: RankingStatus;
}

// Dashboard stats
export interface DashboardStats {
  totalSiswa: number;
  totalKriteria: number;
  totalPenilaian: number;
  totalPerhitungan: number;
  tahunAjaranAktif: string;
}

// Pagination
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}



