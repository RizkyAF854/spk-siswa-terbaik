"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { exportRankingPDF } from "@/lib/export-pdf";
import { exportRankingExcel } from "@/lib/export-excel";
import { FileText, Printer, Download, Filter, GraduationCap, ClipboardList, Award, BookOpen } from "lucide-react";

type Criteria = {
  id: string;
  kode: string;
  nama: string;
  bobot: number;
};

type Assessment = {
  criteriaId: string;
  nilai: number;
};

type Student = {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jurusan: string;
  assessments: Assessment[];
};

type Ranking = {
  ranking: number;
  nis: string;
  nama: string;
  kelas: string;
  nilaiS: number;
  nilaiV: number;
  status: string;
};

const LogoKiri = () => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src="/logo-smk.png" alt="Logo SMK Karya Guna Bhakti 2" className="w-28 h-28 object-contain" />
);


export default function LaporanClient({
  students,
  criterias,
  rankings,
  tahunAjarans,
  classes,
  selectedTahunAjaran,
  selectedClass,
  selectedJenis,
  userRole,
}: {
  students: Student[];
  criterias: Criteria[];
  rankings: Ranking[];
  tahunAjarans: string[];
  classes: string[];
  selectedTahunAjaran: string;
  selectedClass: string;
  selectedJenis: "penilaian" | "ranking";
  userRole: "ADMIN" | "GURU";
}) {
  const router = useRouter();
  const [jenis, setJenis] = useState(selectedJenis);
  const [tahunAjaran, setTahunAjaran] = useState(selectedTahunAjaran);
  const [kelas, setKelas] = useState(selectedClass);

  const isAdmin = userRole === "ADMIN";

  const handleFilterChange = (j: "penilaian" | "ranking", ta: string, kl: string) => {
    setJenis(j);
    setTahunAjaran(ta);
    setKelas(kl);
    router.push(`/laporan?jenis=${j}&tahunAjaran=${ta}&kelas=${kl}`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (jenis === "ranking") {
      await exportRankingPDF(rankings, tahunAjaran, kelas);
    } else {
      // PDF for assessments
      const mockRankingForAssessments = students.map((s, idx) => ({
        ranking: idx + 1,
        nis: s.nis,
        nama: s.nama,
        kelas: s.kelas,
        // Send first 3 assessments as representation or combine scores as display
        nilaiS: s.assessments.reduce((sum, a) => sum + a.nilai, 0) / criterias.length,
        nilaiV: s.assessments.length,
        status: s.assessments.length === criterias.length ? "Lengkap" : "Belum Lengkap",
      }));
      await exportRankingPDF(mockRankingForAssessments, tahunAjaran, kelas);
    }
  };

  const handleExportExcel = () => {
    if (jenis === "ranking") {
      exportRankingExcel(rankings, tahunAjaran, kelas);
    } else {
      // Export assessments excel
      import("xlsx").then((XLSX) => {
        const rows = students.map((s) => {
          const rowObj: Record<string, any> = {
            "NIS": s.nis,
            "Nama Siswa": s.nama,
            "Kelas": s.kelas,
          };
          criterias.forEach((c) => {
            const scoreObj = s.assessments.find((a) => a.criteriaId === c.id);
            rowObj[`${c.kode} - ${c.nama}`] = scoreObj ? scoreObj.nilai : "-";
          });
          return rowObj;
        });

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Penilaian");
        XLSX.writeFile(workbook, `Laporan_Penilaian_${tahunAjaran.replace("/", "-")}_Kelas_${kelas}.xlsx`);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Hidden on Print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Laporan SPK</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Cetak dan ekspor laporan hasil penilaian atau perankingan siswa
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handlePrint}
              disabled={students.length === 0 && rankings.length === 0}
              className="btn btn-secondary flex items-center gap-2 text-xs sm:text-sm py-1.5 px-3"
            >
              <Printer className="w-4 h-4" /> Cetak / Print
            </button>
            <button
              onClick={handleExportPDF}
              disabled={students.length === 0 && rankings.length === 0}
              className="btn btn-secondary border-red-500/20 text-red-500 hover:bg-red-500/10 flex items-center gap-2 text-xs sm:text-sm py-1.5 px-3"
            >
              <FileText className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={students.length === 0 && rankings.length === 0}
              className="btn btn-success flex items-center gap-2 text-xs sm:text-sm py-1.5 px-3"
            >
              <Download className="w-4 h-4" /> Export Excel
            </button>
          </div>
        )}
      </div>

      {/* Filters Card - Hidden on Print */}
      <div className="p-4 rounded-2xl flex flex-col sm:flex-row flex-wrap gap-4 items-stretch sm:items-center no-print animate-fade-in" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[200px]">
          <span className="text-sm font-medium shrink-0" style={{ color: "var(--muted-foreground)" }}>Jenis Laporan:</span>
          <select
            value={jenis}
            onChange={(e) => handleFilterChange(e.target.value as any, tahunAjaran, kelas)}
            className="form-input py-1.5 px-3 w-full sm:max-w-[200px]"
          >
            <option value="ranking">Hasil Ranking WP</option>
            <option value="penilaian">Penilaian Siswa</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[150px]">
          <span className="text-sm font-medium shrink-0" style={{ color: "var(--muted-foreground)" }}>Tahun Ajaran:</span>
          <select
            value={tahunAjaran}
            onChange={(e) => handleFilterChange(jenis, e.target.value, kelas)}
            className="form-input py-1.5 px-3 w-full sm:max-w-[180px]"
          >
            <option value="2025/2026">2025/2026</option>
            {tahunAjarans.filter(ta => ta !== "2025/2026").map((ta) => (
              <option key={ta} value={ta}>{ta}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-[150px]">
          <span className="text-sm font-medium shrink-0" style={{ color: "var(--muted-foreground)" }}>Kelas:</span>
          <select
            value={kelas}
            onChange={(e) => handleFilterChange(jenis, tahunAjaran, e.target.value)}
            className="form-input py-1.5 px-3 w-full sm:max-w-[180px]"
          >
            <option value="all">Semua Kelas</option>
            {classes.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Document Report Preview */}
      <div
        className="p-4 sm:p-8 md:p-12 rounded-3xl shadow-sm border mx-auto max-w-4xl bg-white text-black print:p-0 print:border-none print:shadow-none print:bg-transparent overflow-x-auto"
        style={{ borderColor: "var(--border)" }}
      >
        {/* Kop Surat / Letterhead */}
        <div className="border-b-[3px] border-black pb-0.5 mb-6 text-black min-w-[600px] sm:min-w-0">
          <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] items-center gap-4 text-center pb-2 border-b border-black">
            {/* Logo Kiri */}
            <div className="flex justify-center items-center shrink-0">
              <LogoKiri />
            </div>

            {/* Informasi Sekolah */}
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wide leading-tight">YAYASAN PENDIDIKAN AL-AMIEN</h3>
              <h1 className="text-[14px] font-black uppercase tracking-tight leading-tight">SEKOLAH MENENGAH KEJURUAN (SMK) KARYA GUNA BHAKTI 2</h1>
              <p className="text-[9px] font-semibold flex items-center justify-center gap-2 flex-wrap">
                <span>Teknik Komputer dan Jaringan</span>
                <span>|</span>
                <span>Manajemen Perkantoran</span>
                <span>|</span>
                <span>Akuntansi</span>
              </p>
              <p className="text-[9px] font-semibold">
                NSS. 347028904072 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NPSN. 20223112
              </p>
              <h4 className="text-[10px] font-bold uppercase tracking-wider">STATUS TERAKREDITASI A</h4>
              <p className="text-[8.5px] leading-tight text-zinc-700">
                Kampus A: Jl. Anggrek 1 RT. 05/016 Duren Jaya Kota Bekasi Telp. (021) 88352551
              </p>
              <p className="text-[8.5px] leading-tight text-zinc-700">
                Kampus B: Jl. H. Djole RT. 05/07 Duren Jaya Kota Bekasi Telp. 081211925018
              </p>
              <p className="text-[8.5px] font-medium text-zinc-700">
                Email: <span className="underline">info@smkkgb2.sch.id</span> &nbsp;&nbsp;&nbsp;&nbsp; Website: <span className="underline">www.smkkgb2.sch.id</span>
              </p>
            </div>
          </div>
        </div>

        {/* Document Title */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold uppercase tracking-wider">
            {jenis === "ranking" ? "LAPORAN HASIL PERANKINGAN SISWA TERBAIK" : "LAPORAN MATRIKS PENILAIAN SISWA"}
          </h3>
          <p className="text-xs font-mono text-slate-500 print:text-black mt-1">
            Metode SPK: Weighted Product (WP) | Tahun Ajaran: {tahunAjaran}
          </p>
        </div>

        {/* Info Metadata */}
        <div className="flex justify-between items-center text-xs font-medium mb-4 pb-2 border-b border-dashed border-slate-200">
          <div>
            <span>Kelas: <strong>{kelas === "all" ? "Semua Kelas" : kelas}</strong></span>
          </div>
          <div>
            <span>Tanggal Cetak: <strong>{new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</strong></span>
          </div>
        </div>

        {/* Table Content */}
        {jenis === "ranking" ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2.5 border border-slate-300 text-center font-bold">Peringkat</th>
                  <th className="p-2.5 border border-slate-300 font-bold">NIS</th>
                  <th className="p-2.5 border border-slate-300 font-bold">Nama Siswa</th>
                  <th className="p-2.5 border border-slate-300 font-bold">Kelas</th>
                  <th className="p-2.5 border border-slate-300 text-right font-bold">Vektor S</th>
                  <th className="p-2.5 border border-slate-300 text-right font-bold">Vektor V</th>
                  <th className="p-2.5 border border-slate-300 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {rankings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center p-8 text-slate-400">
                      Tidak ada data perankingan untuk tahun ajaran / kelas ini.
                    </td>
                  </tr>
                ) : (
                  rankings.map((r) => (
                    <tr key={r.nis} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-2.5 border border-slate-300 text-center font-bold">{r.ranking}</td>
                      <td className="p-2.5 border border-slate-300 font-mono">{r.nis}</td>
                      <td className="p-2.5 border border-slate-300 font-medium">{r.nama}</td>
                      <td className="p-2.5 border border-slate-300">{r.kelas}</td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono">{r.nilaiS.toFixed(2)}</td>
                      <td className="p-2.5 border border-slate-300 text-right font-mono font-bold text-blue-900 print:text-black">{r.nilaiV.toFixed(4)}</td>
                      <td className="p-2.5 border border-slate-300 text-center">
                        <span className="px-2 py-0.5 border rounded-full text-[10px] font-semibold">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300">
                  <th className="p-2.5 border border-slate-300 text-center font-bold">No</th>
                  <th className="p-2.5 border border-slate-300 font-bold">NIS</th>
                  <th className="p-2.5 border border-slate-300 font-bold">Nama Siswa</th>
                  <th className="p-2.5 border border-slate-300 font-bold">Kelas</th>
                  {criterias.map((c) => (
                    <th key={c.id} className="p-2.5 border border-slate-300 text-center font-bold" title={c.nama}>
                      {c.kode}
                    </th>
                  ))}
                  <th className="p-2.5 border border-slate-300 text-center font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={5 + criterias.length} className="text-center p-8 text-slate-400">
                      Tidak ada data penilaian untuk tahun ajaran / kelas ini.
                    </td>
                  </tr>
                ) : (
                  students.map((s, idx) => (
                    <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50">
                      <td className="p-2.5 border border-slate-300 text-center">{idx + 1}</td>
                      <td className="p-2.5 border border-slate-300 font-mono">{s.nis}</td>
                      <td className="p-2.5 border border-slate-300 font-medium">{s.nama}</td>
                      <td className="p-2.5 border border-slate-300">{s.kelas}</td>
                      {criterias.map((c) => {
                        const score = s.assessments.find((a) => a.criteriaId === c.id)?.nilai;
                        return (
                          <td key={c.id} className="p-2.5 border border-slate-300 text-center font-mono">
                            {score !== undefined ? score : "-"}
                          </td>
                        );
                      })}
                      <td className="p-2.5 border border-slate-300 text-center">
                        <span className="px-2 py-0.5 border rounded-full text-[10px] font-semibold">
                          {s.assessments.length === criterias.length ? "Lengkap" : "Belum Lengkap"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature Box */}
        <div className="mt-12 flex justify-end">
          <div className="text-center text-xs space-y-1 mr-4">
            <p>Bekasi, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p className="font-bold">Kepala Sekolah,</p>
            <p className="pb-16">SMK Karya Guna Bhakti 2</p>
            <p className="font-bold underline">Yulia Venny Susanti, S.E., M.M.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
