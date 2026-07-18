"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportRankingPDF } from "@/lib/export-pdf";
import { exportRankingExcel } from "@/lib/export-excel";
import { Trophy, FileText, Download, Filter, GraduationCap, Medal, Award } from "lucide-react";
import { getStatusColor } from "@/lib/utils";

type Ranking = {
  id: string;
  studentId: string;
  nilaiS: number;
  nilaiV: number;
  ranking: number;
  tahunAjaran: string;
  status: string;
  student: {
    nis: string;
    nama: string;
    kelas: string;
    jurusan: string;
  };
};

export default function RankingClient({
  rankings,
  tahunAjarans,
  classes,
  selectedTahunAjaran,
  selectedClass,
  userRole,
}: {
  rankings: Ranking[];
  tahunAjarans: string[];
  classes: string[];
  selectedTahunAjaran: string;
  selectedClass: string;
  userRole: "ADMIN" | "GURU";
}) {
  const router = useRouter();
  const [tahunAjaran, setTahunAjaran] = useState(selectedTahunAjaran);
  const [kelas, setKelas] = useState(selectedClass);

  const isAdmin = userRole === "ADMIN";

  const handleFilterChange = (ta: string, kl: string) => {
    setTahunAjaran(ta);
    setKelas(kl);
    router.push(`/ranking?tahunAjaran=${ta}&kelas=${kl}`);
  };

  const formattedData = rankings.map((r) => ({
    ranking: r.ranking,
    nis: r.student.nis,
    nama: r.student.nama,
    kelas: r.student.kelas,
    nilaiS: r.nilaiS,
    nilaiV: r.nilaiV,
    status: r.status,
  }));

  const handleExportPDF = async () => {
    await exportRankingPDF(formattedData, tahunAjaran, kelas);
  };

  const handleExportExcel = () => {
    exportRankingExcel(formattedData, tahunAjaran, kelas);
  };

  const firstPlace = rankings.find((r) => r.ranking === 1);
  const secondToFifth = rankings.filter((r) => r.ranking > 1 && r.ranking <= 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Hasil Ranking</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Daftar peringkat siswa terbaik berdasarkan hasil perhitungan metode Weighted Product
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              disabled={rankings.length === 0}
              className="btn btn-secondary border-red-500/20 text-red-500 hover:bg-red-500/10 flex items-center gap-2"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={rankings.length === 0}
              className="btn btn-success flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        )}
      </div>

      {/* Filters Card */}
      <div className="p-4 rounded-2xl flex flex-wrap gap-4 items-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
          <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Tahun Ajaran:</span>
          <select
            value={tahunAjaran}
            onChange={(e) => handleFilterChange(e.target.value, kelas)}
            className="form-input py-1.5 px-3 max-w-[180px]"
          >
            <option value="2025/2026">2025/2026</option>
            {tahunAjarans.filter(ta => ta !== "2025/2026").map((ta) => (
              <option key={ta} value={ta}>{ta}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>Kelas:</span>
          <select
            value={kelas}
            onChange={(e) => handleFilterChange(tahunAjaran, e.target.value)}
            className="form-input py-1.5 px-3 max-w-[180px]"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Ringkasan Statistik Cards */}
      {rankings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Siswa Terbaik */}
          <div
            className="p-6 rounded-2xl border flex items-center justify-between bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent relative overflow-hidden"
            style={{ borderColor: "rgba(245, 158, 11, 0.3)" }}
          >
            <div className="space-y-1.5 z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-500">Siswa Terbaik</span>
              <h3 className="text-lg font-bold truncate max-w-[200px]" style={{ color: "var(--foreground)" }} title={firstPlace?.student.nama}>
                {firstPlace ? firstPlace.student.nama : "-"}
              </h3>
              <p className="text-xs text-slate-500">Kelas: {firstPlace ? firstPlace.student.kelas : "-"}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-500/30 flex-shrink-0 z-10">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-amber-500/5 blur-xl" />
          </div>

          {/* Card 2: Nilai V Tertinggi */}
          <div
            className="p-6 rounded-2xl border flex items-center justify-between bg-gradient-to-br from-emerald-500/10 via-emerald-600/5 to-transparent relative overflow-hidden"
            style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}
          >
            <div className="space-y-1.5 z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-500">Nilai V Tertinggi</span>
              <h3 className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-500">
                {firstPlace ? firstPlace.nilaiV.toFixed(4) : "0.0000"}
              </h3>
              <p className="text-xs text-slate-500">Peringkat 1</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 flex-shrink-0 z-10">
              <Award className="w-6 h-6" />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/5 blur-xl" />
          </div>

          {/* Card 3: Total Peserta Dinilai */}
          <div
            className="p-6 rounded-2xl border flex items-center justify-between bg-gradient-to-br from-violet-500/10 via-violet-600/5 to-transparent relative overflow-hidden"
            style={{ borderColor: "rgba(139, 92, 246, 0.3)" }}
          >
            <div className="space-y-1.5 z-10">
              <span className="text-xs font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-500">Total Peserta Dinilai</span>
              <h3 className="text-2xl font-black font-mono text-violet-600 dark:text-violet-500">
                {rankings.length} Siswa
              </h3>
              <p className="text-xs text-slate-500">Tahun Ajaran {tahunAjaran}</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/30 flex-shrink-0 z-10">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-violet-500/5 blur-xl" />
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Daftar Peringkat WP</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-20 text-center">Peringkat</th>
                <th className="w-24">NIS</th>
                <th>Nama Siswa</th>
                <th className="w-32">Kelas</th>
                <th className="w-32 text-center">Nilai Vektor S</th>
                <th className="w-32 text-center">Nilai Vektor V (Hasil WP)</th>
                <th className="w-40 text-center">Status Rekomendasi</th>
              </tr>
            </thead>
            <tbody>
              {rankings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <Award className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--muted-foreground)" }} />
                    <p style={{ color: "var(--muted-foreground)" }}>
                      Belum ada data ranking. Jalankan perhitungan terlebih dahulu pada menu **Perhitungan WP**.
                    </p>
                  </td>
                </tr>
              ) : (
                rankings.map((r) => (
                  <tr key={r.id} className={r.ranking === 1 ? "bg-amber-500/5 font-semibold" : ""}>
                    <td className="text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        r.ranking === 1 ? "bg-amber-500 text-white" : r.ranking <= 5 ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700"
                      }`}>
                        {r.ranking}
                      </span>
                    </td>
                    <td><span className="font-mono text-xs badge badge-primary">{r.student.nis}</span></td>
                    <td className="font-medium" style={{ color: "var(--foreground)" }}>{r.student.nama}</td>
                    <td>{r.student.kelas}</td>
                    <td className="text-center font-mono">{r.nilaiS.toFixed(2)}</td>
                    <td className="text-center font-mono font-bold text-emerald-500">{r.nilaiV.toFixed(4)}</td>
                    <td className="text-center">
                      <span className={`badge ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
