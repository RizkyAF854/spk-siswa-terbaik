"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CRITERIA_SCORE_KEYS } from "@/lib/constants";
import type { StudentAssessment, Student, Criteria } from "@/types";

export async function getAssessments(kelas?: string) {
  const where = kelas && kelas !== "all"
    ? { student: { kelas } }
    : {};

  const assessments = await prisma.assessment.findMany({
    where,
    include: {
      student: true,
      criteria: true,
    },
    orderBy: { student: { nama: "asc" } },
  });

  return assessments;
}

/**
 * Returns assessments grouped by student in the StudentAssessment[] shape.
 * Each entry has: { id, student, scores: { nilaiAkademik: 85, sikap: 90, ... } }
 */
export async function getGroupedAssessments(): Promise<StudentAssessment[]> {
  const students = await prisma.student.findMany({
    include: {
      assessments: {
        include: { criteria: true },
      },
    },
    orderBy: { nama: "asc" },
  });

  // Only include students that have at least one assessment
  return students
    .filter((s) => s.assessments.length > 0)
    .map((s) => {
      const scores: Record<string, number> = {};
      for (const a of s.assessments) {
        const key = CRITERIA_SCORE_KEYS[a.criteria.kode] ?? a.criteria.kode.toLowerCase();
        scores[key] = a.nilai;
      }
      return {
        id: `asmt-${s.id}`, // virtual composite id
        student: {
          id: s.id,
          nis: s.nis,
          nama: s.nama,
          jenisKelamin: s.jenisKelamin,
          kelas: s.kelas,
          jurusan: s.jurusan,
          tahunAjaran: s.tahunAjaran,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        } as Student,
        scores,
      };
    });
}

/**
 * Returns students that do NOT have any assessment rows yet.
 */
export async function getUnassessedStudents(): Promise<Student[]> {
  const students = await prisma.student.findMany({
    where: {
      assessments: { none: {} },
    },
    orderBy: { nama: "asc" },
  });
  return students as unknown as Student[];
}

export async function getStudentAssessments(studentId: string) {
  return prisma.assessment.findMany({
    where: { studentId },
    include: { criteria: true },
    orderBy: { criteria: { kode: "asc" } },
  });
}

export async function saveAssessments(studentId: string, values: { criteriaId: string; nilai: number }[]) {
  // Validate values
  for (const v of values) {
    if (v.nilai < 0 || v.nilai > 100) {
      return { error: "Nilai harus antara 0 - 100" };
    }
  }

  // Upsert all assessments
  for (const v of values) {
    await prisma.assessment.upsert({
      where: {
        studentId_criteriaId: {
          studentId,
          criteriaId: v.criteriaId,
        },
      },
      update: { nilai: v.nilai },
      create: {
        studentId,
        criteriaId: v.criteriaId,
        nilai: v.nilai,
      },
    });
  }

  revalidatePath("/penilaian");
  revalidatePath("/perhitungan");
  return { success: true };
}

export async function deleteAssessment(studentId: string) {
  await prisma.assessment.deleteMany({ where: { studentId } });
  revalidatePath("/penilaian");
  revalidatePath("/perhitungan");
  return { success: true };
}

export async function getClasses() {
  const students = await prisma.student.findMany({
    select: { kelas: true },
    distinct: ["kelas"],
    orderBy: { kelas: "asc" },
  });
  return students.map((s) => s.kelas);
}
