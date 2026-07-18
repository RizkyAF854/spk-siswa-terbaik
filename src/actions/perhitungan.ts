"use server";

import { prisma } from "@/lib/prisma";
import { calculateWP } from "@/lib/weighted-product";
import { revalidatePath } from "next/cache";
import type { StudentWithAssessments } from "@/types";

export async function runCalculation(tahunAjaran?: string, kelas?: string) {
  const where: any = {};
  if (tahunAjaran && tahunAjaran !== "all") where.tahunAjaran = tahunAjaran;
  if (kelas && kelas !== "all") where.kelas = kelas;

  const students = await prisma.student.findMany({
    where,
    include: {
      assessments: {
        include: { criteria: true },
      },
    },
    orderBy: { nama: "asc" },
  });

  const criterias = await prisma.criteria.findMany({ orderBy: { kode: "asc" } });

  // Only include students with all assessments
  const completeStudents = students.filter(
    (s) => s.assessments.length === criterias.length
  ) as StudentWithAssessments[];

  if (completeStudents.length === 0) {
    return { error: "Tidak ada siswa dengan penilaian lengkap" };
  }

  const results = calculateWP(completeStudents, criterias);

  // Save rankings
  const ta = tahunAjaran || "2025/2026";
  if (kelas && kelas !== "all") {
    const studentIds = students.map((s) => s.id);
    await prisma.ranking.deleteMany({
      where: {
        tahunAjaran: ta,
        studentId: { in: studentIds },
      },
    });
  } else {
    await prisma.ranking.deleteMany({ where: { tahunAjaran: ta } });
  }
  
  for (const r of results) {
    await prisma.ranking.create({
      data: {
        studentId: r.studentId,
        nilaiS: r.nilaiS,
        nilaiV: r.nilaiV,
        ranking: r.ranking,
        tahunAjaran: ta,
        kelas: r.kelas || "",
        status: r.status,
      },
    });
  }

  revalidatePath("/perhitungan");
  revalidatePath("/ranking");
  return { success: true, results };
}

export async function getRankings(tahunAjaran?: string, kelas?: string) {
  const where: any = {};
  if (tahunAjaran && tahunAjaran !== "all") where.tahunAjaran = tahunAjaran;
  if (kelas && kelas !== "all") where.student = { kelas };

  return prisma.ranking.findMany({
    where,
    include: { student: true },
    orderBy: { ranking: "asc" },
  });
}

export async function getCalculationData(tahunAjaran?: string, kelas?: string) {
  const where: any = {};
  if (tahunAjaran && tahunAjaran !== "all") where.tahunAjaran = tahunAjaran;
  if (kelas && kelas !== "all") where.kelas = kelas;

  const students = await prisma.student.findMany({
    where,
    include: {
      assessments: {
        include: { criteria: true },
      },
    },
    orderBy: { nama: "asc" },
  });

  const criterias = await prisma.criteria.findMany({ orderBy: { kode: "asc" } });

  return { students, criterias };
}

export async function getTahunAjarans() {
  const students = await prisma.student.findMany({
    select: { tahunAjaran: true },
    distinct: ["tahunAjaran"],
    orderBy: { tahunAjaran: "desc" },
  });
  return students.map((s) => s.tahunAjaran);
}
