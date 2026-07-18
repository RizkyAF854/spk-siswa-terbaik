import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      nama: "Administrator",
      role: "ADMIN",
    },
  });

  // Create guru user
  const guruPassword = await bcrypt.hash("guru123", 10);
  await prisma.user.upsert({
    where: { username: "guru" },
    update: {},
    create: {
      username: "guru",
      password: guruPassword,
      nama: "Guru Penilai",
      role: "GURU",
    },
  });

  console.log("✅ Users seeded");

  // Create 4 criteria
  const criterias = [
    { kode: "C1", nama: "Nilai Akademik", bobot: 40, tipe: "BENEFIT" as const },
    { kode: "C2", nama: "Sikap", bobot: 25, tipe: "BENEFIT" as const },
    { kode: "C3", nama: "Kehadiran", bobot: 20, tipe: "BENEFIT" as const },
    { kode: "C4", nama: "Prestasi Non Akademik", bobot: 15, tipe: "BENEFIT" as const },
  ];

  for (const c of criterias) {
    await prisma.criteria.upsert({
      where: { kode: c.kode },
      update: { nama: c.nama, bobot: c.bobot, tipe: c.tipe },
      create: c,
    });
  }
  console.log("✅ Criterias seeded");

  // Delete old students, assessments, and rankings first
  await prisma.ranking.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.student.deleteMany();
  console.log("🗑️ Old student data cleared");

  // Create 16 students
  const students = [
    { nis: "2324.10.001", nama: "Afifah Aulia Rahmadani", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 1", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.005", nama: "Arsa Myta Purwanti", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 1", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.024", nama: "Pratista Juani Putri", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 1", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.019", nama: "M Rizki Maulana Putra", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 1", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.037", nama: "Abi Esa Rusgita", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 2", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.072", nama: "Zanjabila Fasha", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 2", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.059", nama: "Nur Sabrina Gunadi", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 2", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.054", nama: "Muhamad Hamzah", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 2", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.084", nama: "Hafiz Arya Fiqri", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 3", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.107", nama: "Zaky Aditya Nugraha", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 3", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.096", nama: "Najwa Fitria", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 3", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.076", nama: "Arya Yudistira", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 3", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.125", nama: "Lucky Yesta Saputra", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 4", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.140", nama: "Titania Aulia Putri", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 4", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.120", nama: "Fitria Nayla Nur Nabila", jenisKelamin: "PEREMPUAN" as const, kelas: "XII TKJ 4", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
    { nis: "2324.10.128", nama: "Muhammad Devis", jenisKelamin: "LAKI_LAKI" as const, kelas: "XII TKJ 4", jurusan: "Teknik Komputer dan Jaringan", tahunAjaran: "2025/2026" },
  ];

  for (const s of students) {
    await prisma.student.upsert({
      where: { nis: s.nis },
      update: { nama: s.nama, jenisKelamin: s.jenisKelamin, kelas: s.kelas, jurusan: s.jurusan, tahunAjaran: s.tahunAjaran },
      create: s,
    });
  }
  console.log("✅ Students seeded");

  // Create assessments for all students
  const allStudents = await prisma.student.findMany();
  const allCriterias = await prisma.criteria.findMany();

  // Scores order: [C1 (Akademik), C2 (Sikap), C3 (Kehadiran), C4 (Prestasi)]
  // Ordered by NIS to match student creation order
  const scoreMap: Record<string, number[]> = {
    "2324.10.001": [95, 94, 95, 95], // Afifah Aulia Rahmadani
    "2324.10.005": [96, 96, 96, 95], // Arsa Myta Purwanti
    "2324.10.024": [88, 91, 92, 80], // Pratista Juani Putri
    "2324.10.019": [76, 77, 80, 60], // M Rizki Maulana Putra
    "2324.10.037": [91, 93, 95, 90], // Abi Esa Rusgita
    "2324.10.072": [94, 95, 96, 90], // Zanjabila Fasha
    "2324.10.059": [84, 85, 89, 80], // Nur Sabrina Gunadi
    "2324.10.054": [76, 78, 80, 60], // Muhamad Hamzah
    "2324.10.084": [96, 95, 95, 95], // Hafiz Arya Fiqri
    "2324.10.107": [92, 94, 96, 90], // Zaky Aditya Nugraha
    "2324.10.096": [89, 90, 92, 80], // Najwa Fitria
    "2324.10.076": [76, 79, 80, 60], // Arya Yudistira
    "2324.10.125": [91, 93, 95, 80], // Lucky Yesta Saputra
    "2324.10.140": [91, 93, 95, 80], // Titania Aulia Putri
    "2324.10.120": [90, 92, 94, 80], // Fitria Nayla Nur Nabila
    "2324.10.128": [76, 77, 80, 60], // Muhammad Devis
  };

  // Sort criterias by kode to ensure correct order
  const sortedCriterias = allCriterias.sort((a, b) => a.kode.localeCompare(b.kode));

  for (const student of allStudents) {
    const scores = scoreMap[student.nis];
    if (!scores) continue;
    for (let j = 0; j < sortedCriterias.length; j++) {
      await prisma.assessment.upsert({
        where: {
          studentId_criteriaId: {
            studentId: student.id,
            criteriaId: sortedCriterias[j].id,
          },
        },
        update: { nilai: scores[j] },
        create: {
          studentId: student.id,
          criteriaId: sortedCriterias[j].id,
          nilai: scores[j],
        },
      });
    }
  }
  console.log("✅ Assessments seeded");

  console.log("🎉 Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
