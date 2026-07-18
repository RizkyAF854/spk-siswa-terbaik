"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const StudentSchema = z.object({
  nis: z.string().min(1, "NIS wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  jenisKelamin: z.enum(["LAKI_LAKI", "PEREMPUAN"]),
  kelas: z.string().min(1, "Kelas wajib diisi"),
  jurusan: z.string().min(1, "Jurusan wajib diisi"),
  tahunAjaran: z.string().min(1, "Tahun ajaran wajib diisi"),
});

export async function getStudents(search?: string, page = 1, perPage = 10) {
  const where = search
    ? {
        OR: [
          { nama: { contains: search, mode: "insensitive" as const } },
          { nis: { contains: search, mode: "insensitive" as const } },
          { kelas: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.student.count({ where }),
  ]);

  return { students, total, totalPages: Math.ceil(total / perPage) };
}

export async function getAllStudents() {
  return prisma.student.findMany({ orderBy: { nama: "asc" } });
}

export async function getStudentById(id: string) {
  return prisma.student.findUnique({ where: { id } });
}

export async function createStudent(formData: FormData) {
  const raw = {
    nis: formData.get("nis") as string,
    nama: formData.get("nama") as string,
    jenisKelamin: formData.get("jenisKelamin") as string,
    kelas: formData.get("kelas") as string,
    jurusan: formData.get("jurusan") as string,
    tahunAjaran: formData.get("tahunAjaran") as string,
  };

  const parsed = StudentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.student.findUnique({ where: { nis: raw.nis } });
  if (existing) return { error: "NIS sudah terdaftar!" };

  await prisma.student.create({ data: parsed.data as any });
  revalidatePath("/siswa");
  return { success: true };
}

export async function updateStudent(id: string, formData: FormData) {
  const raw = {
    nis: formData.get("nis") as string,
    nama: formData.get("nama") as string,
    jenisKelamin: formData.get("jenisKelamin") as string,
    kelas: formData.get("kelas") as string,
    jurusan: formData.get("jurusan") as string,
    tahunAjaran: formData.get("tahunAjaran") as string,
  };

  const parsed = StudentSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.student.findFirst({
    where: { nis: raw.nis, NOT: { id } },
  });
  if (existing) return { error: "NIS sudah digunakan siswa lain!" };

  await prisma.student.update({ where: { id }, data: parsed.data as any });
  revalidatePath("/siswa");
  return { success: true };
}

export async function deleteStudent(id: string) {
  await prisma.student.delete({ where: { id } });
  revalidatePath("/siswa");
  return { success: true };
}
