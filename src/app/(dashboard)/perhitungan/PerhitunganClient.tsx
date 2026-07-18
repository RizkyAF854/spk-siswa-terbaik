"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { runCalculation } from "@/actions/perhitungan";
import { Calculator, ArrowRight, RefreshCw, AlertTriangle, FileText, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getStatusColor } from "@/lib/utils";

type Criteria = {
  id: string;
  kode: string;
  nama: string;
  bobot: number;
  tipe: "BENEFIT" | "COST";
};

type Assessment = {
  id: string;
  criteriaId: string;
  nilai: number;
};

type Student = {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jurusan: string;
  tahunAjaran: string;
  assessments: Assessment[];
};

type StepDetails = {
  criteriaName: string;
  nilai: number;
  bobot: number;
  normalizedBobot: number;
  pangkat: number;
};

type WPResult = {
  studentId: string;
  studentName: string;
  nis: string;
  kelas: string;
  nilaiS: number;
  nilaiV: number;
  ranking: number;
  status: string;
  details: StepDetails[];
};

export default function PerhitunganClient({
  students,
  criterias,
  tahunAjarans,
  classes,
  selectedTahunAjaran,
  selectedClass,
  initialResults,
  userRole,
}: {
  students: Student[];
  criterias: Criteria[];
  tahunAjarans: string[];
  classes: string[];
  selectedTahunAjaran: string;
  selectedClass: string;
  initialResults: WPResult[];
  userRole: "ADMIN" | "GURU";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [tahunAjaran, setTahunAjaran] = useState(selectedTahunAjaran);
  const [kelas, setKelas] = useState(selectedClass);
  const [activeTab, setActiveTab] = useState<"matriks" | "vektorS" | "vektorV">("matriks");
  const [showAll, setShowAll] = useState(false);

  const isAdmin = userRole === "ADMIN";

  const handleFilterChange = (ta: string, kl: string) => {
    setTahunAjaran(ta);
    setKelas(kl);
    router.push(`/perhitungan?tahunAjaran=${ta}&kelas=${kl}`);
  };

  const handleCalculate = async () => {
    startTransition(async () => {
      const res = await runCalculation(tahunAjaran, kelas);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Perhitungan WP berhasil dijalankan dan disimpan!");
        router.refresh();
      }
    });
  };

  // Calculations for display
  // Step 1: Normalisasi Bobot
  const totalBobotAbsolut = criterias.reduce((sum, c) => sum + c.bobot, 0);
  const normalizedCriterias = criterias.map((c) => {
    const Wj = c.tipe === "BENEFIT" ? c.bobot / totalBobotAbsolut : -(c.bobot / totalBobotAbsolut);
    return {
      ...c,
      normalizedBobot: Wj,
    };
  });

  // Filter students who have complete assessments
  const completeStudents = students.filter(
    (s) => s.assessments.length === criterias.length
  );
  const incompleteStudents = students.filter(
    (s) => s.assessments.length !== criterias.length
  );

  const totalS = initialResults.reduce((sum, r) => sum + r.nilaiS, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Perhitungan Siswa Terbaik</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Proses penilaian dan penentuan peringkat siswa terbaik menggunakan metode Weighted Product (WP)
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleCalculate}
            disabled={isPending || completeStudents.length === 0}
            className="btn btn-primary"
          >
            <RefreshCw className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`} />
            Hitung & Simpan Peringkat
          </button>
        )}
      </div>

      {/* Read-only Banner for Guru */}
      {!isAdmin && (
        <div className="p-4 rounded-2xl flex gap-3 border" style={{ background: "rgba(59,130,246,0.05)", borderColor: "rgba(59,130,246,0.2)" }}>
          <ShieldCheck className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Akses Terbatas: Mode Lihat Saja</h4>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Anda masuk sebagai Guru. Anda dapat melihat seluruh tahapan perhitungan secara transparan, namun hanya Admin yang dapat menyimpan hasil peringkat akhir.
            </p>
          </div>
        </div>
      )}

      {/* Filters Card */}
      <div className="p-4 rounded-2xl flex flex-wrap gap-4 items-center" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-2">
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

        <div className="ml-auto text-xs font-semibold" style={{ color: "var(--muted-foreground)" }}>
          {completeStudents.length} dari {students.length} siswa lengkap
        </div>
      </div>

      {/* Warnings / Infos */}
      {incompleteStudents.length > 0 && (
        <div className="p-4 rounded-2xl flex gap-3 border bg-amber-500/5" style={{ borderColor: "rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Siswa dengan Penilaian Belum Lengkap ({incompleteStudents.length})</h4>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Ada {incompleteStudents.length} siswa yang belum memiliki nilai lengkap untuk semua kriteria. Siswa-siswa ini **tidak diikutkan** dalam perhitungan peringkat. Silakan lengkapi nilainya terlebih dahulu di halaman Penilaian.
            </p>
          </div>
        </div>
      )}

      {completeStudents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
          <Calculator className="w-16 h-16 mx-auto opacity-20 mb-4" />
          <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Belum Ada Data Perhitungan</h3>
          <p className="text-sm mt-1 max-w-md mx-auto" style={{ color: "var(--muted-foreground)" }}>
            Silakan isi penilaian untuk minimal 1 siswa di kelas ini terlebih dahulu agar perhitungan peringkat dapat dilakukan.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Tabs Menu */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b pb-4 gap-4" style={{ borderColor: "var(--border)" }}>
            <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
              <button
                onClick={() => {
                  setActiveTab("matriks");
                  setShowAll(false);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  !showAll && activeTab === "matriks"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                1. Tabel Nilai Siswa
              </button>
              <button
                onClick={() => {
                  setActiveTab("vektorS");
                  setShowAll(false);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  !showAll && activeTab === "vektorS"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                2. Skor Preferensi (S)
              </button>
              <button
                onClick={() => {
                  setActiveTab("vektorV");
                  setShowAll(false);
                }}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                  !showAll && activeTab === "vektorV"
                    ? "bg-white dark:bg-slate-900 shadow-sm text-blue-600 dark:text-blue-400 font-bold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                3. Nilai Akhir & Peringkat
              </button>
            </div>

            <button
              onClick={() => setShowAll(!showAll)}
              className={`btn ${showAll ? "btn-primary" : "btn-secondary"} flex items-center gap-2 text-xs py-2 px-4`}
            >
              <FileText className="w-4 h-4" />
              {showAll ? "Tampilkan Per Tahap" : "Tampilkan Semua Tahapan"}
            </button>
          </div>

          <div className="space-y-10">
            {/* STEP 1: Normalisasi Bobot */}
            {(showAll || activeTab === "vektorS") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}>1</span>
                  <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tahap 1: Penyesuaian Bobot Kriteria</h2>
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Pada tahap ini, bobot setiap kriteria diubah menjadi bentuk proporsional (dibagi total bobot keseluruhan). Kriteria bertipe <strong>Benefit</strong> (semakin tinggi semakin baik) akan bernilai positif, sedangkan <strong>Cost</strong> (semakin rendah semakin baik) bernilai negatif.
                </p>

                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Kriteria</th>
                        <th>Nama</th>
                        <th>Tipe</th>
                        <th>Bobot Awal</th>
                        <th>Bobot Setelah Penyesuaian</th>
                      </tr>
                    </thead>
                    <tbody>
                      {normalizedCriterias.map((c) => (
                        <tr key={c.id}>
                          <td><span className="font-mono text-xs badge badge-primary">{c.kode}</span></td>
                          <td className="font-medium" style={{ color: "var(--foreground)" }}>{c.nama}</td>
                          <td>
                            <span className={`badge ${c.tipe === "BENEFIT" ? "badge-success" : "badge-danger"}`}>
                              {c.tipe}
                            </span>
                          </td>
                          <td>{c.bobot}%</td>
                          <td className="font-mono font-semibold text-blue-500">{c.normalizedBobot.toFixed(4)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 dark:bg-slate-900 font-semibold" style={{ borderTop: "2px solid var(--border)" }}>
                        <td colSpan={3} className="text-right">Total:</td>
                        <td>{totalBobotAbsolut}%</td>
                        <td className="font-mono">
                          {normalizedCriterias.reduce((sum, c) => sum + Math.abs(c.normalizedBobot), 0).toFixed(2)} (1.00)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 2: Matriks Keputusan */}
            {(showAll || activeTab === "matriks") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}>2</span>
                  <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tahap 2: Tabel Nilai Siswa (Data Asli)</h2>
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Berikut adalah data nilai asli setiap siswa untuk masing-masing kriteria penilaian yang telah dimasukkan.
                </p>

                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-16">No</th>
                        <th>Nama Siswa</th>
                        {criterias.map((c) => (
                          <th key={c.id} className="text-center font-mono">{c.kode}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {completeStudents.map((s, idx) => (
                        <tr key={s.id}>
                          <td>{idx + 1}</td>
                          <td className="font-medium" style={{ color: "var(--foreground)" }}>{s.nama}</td>
                          {criterias.map((c) => {
                            const score = s.assessments.find((a) => a.criteriaId === c.id)?.nilai || 0;
                            return (
                              <td key={c.id} className="text-center font-mono">{score}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 3: Perhitungan Vektor S */}
            {(showAll || activeTab === "vektorS") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}>3</span>
                  <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tahap 3: Perhitungan Skor Preferensi (Si)</h2>
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Skor Preferensi (Si) menunjukkan skor total setiap siswa. Dihitung dengan mengalikan semua nilai siswa yang sudah dipangkatkan sesuai bobot masing-masing kriteria. Semakin tinggi skor Si, semakin baik performa siswa.
                </p>

                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-16">No</th>
                        <th>Nama Siswa</th>
                        {criterias.map((c) => (
                          <th key={c.id} className="text-center font-mono" title={`${c.nama} dipangkatkan bobot`}>{c.kode}</th>
                        ))}
                        <th className="text-center bg-blue-500/5 font-bold">Skor Preferensi (Si)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialResults.map((r, idx) => (
                        <tr key={r.studentId}>
                          <td>{idx + 1}</td>
                          <td className="font-medium" style={{ color: "var(--foreground)" }}>{r.studentName}</td>
                          {r.details.map((detail, dIdx) => (
                            <td key={dIdx} className="text-center font-mono text-xs text-slate-500">
                              {detail.nilai}<sup>{detail.normalizedBobot.toFixed(4)}</sup>
                              <span className="block text-[10px] text-blue-500/80">= {detail.pangkat.toFixed(4)}</span>
                            </td>
                          ))}
                          <td className="text-center font-mono font-bold bg-blue-500/5 text-blue-600">{r.nilaiS.toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 dark:bg-slate-900 font-bold" style={{ borderTop: "2px solid var(--border)" }}>
                        <td colSpan={2 + criterias.length} className="text-right text-blue-600">Total Skor Preferensi Semua Siswa:</td>
                        <td className="text-center font-mono text-blue-600">{totalS.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 4: Perhitungan Vektor V */}
            {(showAll || activeTab === "vektorV") && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}>4</span>
                  <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tahap 4: Perhitungan Nilai Akhir (Vi)</h2>
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Nilai Akhir (Vi) digunakan untuk menentukan peringkat. Dihitung dengan membagi Skor Preferensi (Si) siswa dengan total Skor Preferensi semua siswa. Siswa dengan Nilai Akhir tertinggi menempati peringkat pertama.
                </p>

                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-16">No</th>
                        <th>Nama Siswa</th>
                        <th className="text-center">Skor Preferensi (Si)</th>
                        <th className="text-center">Total Skor Semua Siswa</th>
                        <th className="text-center bg-emerald-500/5 font-bold">Nilai Akhir (Vi)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialResults.map((r, idx) => (
                        <tr key={r.studentId}>
                          <td>{idx + 1}</td>
                          <td className="font-medium" style={{ color: "var(--foreground)" }}>{r.studentName}</td>
                          <td className="text-center font-mono">{r.nilaiS.toFixed(2)}</td>
                          <td className="text-center font-mono text-slate-400">/ {totalS.toFixed(2)}</td>
                          <td className="text-center font-mono font-bold bg-emerald-500/5 text-emerald-600">{r.nilaiV.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* STEP 5: Hasil Ranking */}
            {(showAll || activeTab === "vektorV") && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg font-bold text-sm text-white" style={{ background: "linear-gradient(135deg, #1e3a5f, #2563eb)" }}>5</span>
                    <h2 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tahap 5: Hasil Peringkat Siswa Terbaik</h2>
                  </div>
                </div>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Berikut adalah urutan peringkat siswa terbaik berdasarkan Nilai Akhir (Vi) tertinggi. Status rekomendasi diberikan secara otomatis sebagai bentuk apresiasi.
                </p>

                <div className="rounded-2xl overflow-hidden border" style={{ borderColor: "var(--border)", background: "var(--card)" }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="w-20 text-center">Ranking</th>
                        <th className="w-24">NIS</th>
                        <th>Nama Siswa</th>
                        <th className="w-32">Kelas</th>
                        <th className="w-32 text-center">Skor (Si)</th>
                        <th className="w-32 text-center">Nilai Akhir (Vi)</th>
                        <th className="w-40 text-center">Status Rekomendasi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {initialResults.map((r) => (
                        <tr key={r.studentId} className={r.ranking === 1 ? "bg-amber-500/5 font-semibold" : ""}>
                          <td className="text-center">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                              r.ranking === 1 ? "bg-amber-500 text-white" : r.ranking <= 5 ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-700"
                            }`}>
                              {r.ranking}
                            </span>
                          </td>
                          <td><span className="font-mono text-xs badge badge-primary">{r.nis}</span></td>
                          <td style={{ color: "var(--foreground)" }}>{r.studentName}</td>
                          <td>{r.kelas}</td>
                          <td className="text-center font-mono">{r.nilaiS.toFixed(2)}</td>
                          <td className="text-center font-mono font-bold text-emerald-500">{r.nilaiV.toFixed(4)}</td>
                          <td className="text-center">
                            <span className={`badge ${getStatusColor(r.status)}`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
