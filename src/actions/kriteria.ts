"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CriteriaSchema = z.object({
  kode: z.string().min(1, "Kode wajib diisi"),
  nama: z.string().min(1, "Nama wajib diisi"),
  bobot: z.number().min(1, "Bobot minimal 1").max(100, "Bobot maksimal 100"),
  tipe: z.enum(["BENEFIT", "COST"]),
});

export async function getCriterias() {
  return prisma.criteria.findMany({ orderBy: { kode: "asc" } });
}

export async function createCriteria(formData: FormData) {
  const raw = {
    kode: formData.get("kode") as string,
    nama: formData.get("nama") as string,
    bobot: parseFloat(formData.get("bobot") as string),
    tipe: formData.get("tipe") as string,
  };

  const parsed = CriteriaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const existing = await prisma.criteria.findUnique({ where: { kode: raw.kode } });
  if (existing) return { error: "Kode kriteria sudah ada!" };

  // Check total bobot
  const currentTotal = await prisma.criteria.aggregate({ _sum: { bobot: true } });
  const newTotal = (currentTotal._sum.bobot || 0) + raw.bobot;
  if (newTotal > 100) {
    return { error: `Total bobot akan melebihi 100% (saat ini: ${currentTotal._sum.bobot || 0}%)` };
  }

  await prisma.criteria.create({ data: parsed.data as any });
  revalidatePath("/kriteria");
  return { success: true };
}

export async function updateCriteria(id: string, formData: FormData) {
  const raw = {
    kode: formData.get("kode") as string,
    nama: formData.get("nama") as string,
    bobot: parseFloat(formData.get("bobot") as string),
    tipe: formData.get("tipe") as string,
  };

  const parsed = CriteriaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  // Check total bobot excluding current
  const currentCriteria = await prisma.criteria.findUnique({ where: { id } });
  const currentTotal = await prisma.criteria.aggregate({ _sum: { bobot: true } });
  const newTotal = (currentTotal._sum.bobot || 0) - (currentCriteria?.bobot || 0) + raw.bobot;
  if (newTotal > 100) {
    return { error: `Total bobot akan melebihi 100% (tersedia: ${100 - ((currentTotal._sum.bobot || 0) - (currentCriteria?.bobot || 0))}%)` };
  }

  await prisma.criteria.update({ where: { id }, data: parsed.data as any });
  revalidatePath("/kriteria");
  return { success: true };
}

export async function deleteCriteria(id: string) {
  await prisma.criteria.delete({ where: { id } });
  revalidatePath("/kriteria");
  return { success: true };
}
