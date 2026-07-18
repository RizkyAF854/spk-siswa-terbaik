"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UserSchema = z.object({
  username: z.string().min(3, "Username minimal 3 karakter"),
  nama: z.string().min(1, "Nama wajib diisi"),
  role: z.enum(["ADMIN", "GURU"]),
});

export async function getUsers() {
  return prisma.user.findMany({
    select: { id: true, username: true, nama: true, role: true, plainPassword: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    nama: formData.get("nama") as string,
    role: formData.get("role") as string,
  };
  const password = formData.get("password") as string;

  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!password || password.length < 6) return { error: "Password minimal 6 karakter" };

  const existing = await prisma.user.findUnique({ where: { username: raw.username } });
  if (existing) return { error: "Username sudah terdaftar!" };

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { ...parsed.data, password: hashedPassword, plainPassword: password } as any,
  });

  revalidatePath("/pengguna");
  return { success: true };
}

export async function updateUser(id: string, formData: FormData) {
  const raw = {
    username: formData.get("username") as string,
    nama: formData.get("nama") as string,
    role: formData.get("role") as string,
  };
  const password = formData.get("password") as string;

  const parsed = UserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.user.findFirst({
    where: { username: raw.username, NOT: { id } },
  });
  if (existing) return { error: "Username sudah digunakan!" };

  const data: any = { ...parsed.data };
  if (password && password.length > 0) {
    if (password.length < 6) return { error: "Password minimal 6 karakter" };
    data.password = await bcrypt.hash(password, 10);
    data.plainPassword = password;
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/pengguna");
  return { success: true };
}

export async function deleteUser(id: string) {
  await prisma.user.delete({ where: { id } });
  revalidatePath("/pengguna");
  return { success: true };
}

export async function updateProfile(id: string, formData: FormData) {
  const nama = formData.get("nama") as string;
  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!nama) return { error: "Nama wajib diisi" };

  const data: any = { nama };

  if (newPassword) {
    if (newPassword.length < 6) return { error: "Password baru minimal 6 karakter" };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return { error: "User tidak ditemukan" };

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return { error: "Password saat ini salah" };

    data.password = await bcrypt.hash(newPassword, 10);
    data.plainPassword = newPassword;
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/profil");
  return { success: true };
}
