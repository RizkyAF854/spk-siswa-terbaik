import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/prisma";
import { getRankings } from "@/actions/perhitungan";
import { Users, Sliders, FileSpreadsheet, Calculator, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TopStudents } from "@/components/dashboard/top-students";
import { TAHUN_AJARAN_AKTIF } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await requireAuth();
  const isAdmin = session.user.role === "ADMIN";

  const tahunAjaranAktif = TAHUN_AJARAN_AKTIF;

  const [totalSiswa, totalKriteria, totalPenilaian, dbRankings] = await Promise.all([
    prisma.student.count(),
    prisma.criteria.count(),
    prisma.student.count({
      where: {
        assessments: { some: {} },
      },
    }),
    isAdmin ? getRankings(tahunAjaranAktif, "all") : Promise.resolve([]),
  ]);

  const totalPerhitungan = dbRankings.length > 0 ? 1 : 0;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-lg">
        {/* Subtle accent blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 translate-x-12 -translate-y-12" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Sistem Pendukung Keputusan</p>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Selamat datang, {session.user.nama}
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Portal evaluasi kriteria dan rekomendasi siswa berprestasi di SMK Karya Guna Bhakti 2 Kota Bekasi.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 bg-slate-850 px-4 py-2 rounded-xl border border-slate-700/50 w-fit">
            <Calendar className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200">Tahun Ajaran: {tahunAjaranAktif}</span>
          </div>
        </div>
      </div>

      {/* Analytics Card Grid */}
      {isAdmin ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Siswa"
            value={totalSiswa}
            description="Siswa terdaftar"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Kriteria Aktif"
            value={totalKriteria}
            description="Kriteria penilaian"
            icon={Sliders}
            color="amber"
          />
          <StatCard
            title="Siswa Dinilai"
            value={totalPenilaian}
            description="Sudah dinilai"
            icon={FileSpreadsheet}
            color="emerald"
          />
          <StatCard
            title="Periode Aktif"
            value={tahunAjaranAktif}
            description="Tahun ajaran berjalan"
            icon={Calculator}
            color="purple"
          />
        </div>
      ) : (
        /* GURU: Only show Siswa & Penilaian stats */
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            title="Total Siswa"
            value={totalSiswa}
            description="Siswa terdaftar aktif"
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Siswa Dinilai"
            value={totalPenilaian}
            description="Data penilaian diinput"
            icon={FileSpreadsheet}
            color="emerald"
          />
        </div>
      )}

      {/* Top 5 Students Table — ADMIN only */}
      {isAdmin && (
        <TopStudents rankings={dbRankings as any} />
      )}
    </div>
  );
}
