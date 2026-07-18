"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { saveAssessments } from "@/actions/penilaian";
import { ArrowLeft, Save, GraduationCap, ClipboardList, Info } from "lucide-react";
import { toast } from "sonner";

type Student = {
  id: string;
  nis: string;
  nama: string;
  kelas: string;
  jurusan: string;
  tahunAjaran: string;
};

type Criteria = {
  id: string;
  kode: string;
  nama: string;
  bobot: number;
  tipe: string;
};

type Assessment = {
  criteriaId: string;
  nilai: number;
};

export default function InputPenilaianClient({
  student,
  criterias,
  existingAssessments,
}: {
  student: Student;
  criterias: Criteria[];
  existingAssessments: Assessment[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Create local state for each criteria input
  const [scores, setScores] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    criterias.forEach((c) => {
      const existing = existingAssessments.find((a) => a.criteriaId === c.id);
      initial[c.id] = existing ? existing.nilai : 0;
    });
    return initial;
  });

  const handleScoreChange = (criteriaId: string, value: string) => {
    let num = parseFloat(value);
    if (isNaN(num)) num = 0;
    setScores((prev) => ({
      ...prev,
      [criteriaId]: num,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate ranges
    const formattedValues = Object.entries(scores).map(([criteriaId, nilai]) => ({
      criteriaId,
      nilai,
    }));

    for (const v of formattedValues) {
      if (v.nilai < 0 || v.nilai > 100) {
        toast.error(`Nilai kriteria harus di antara 0 dan 100!`);
        return;
      }
    }

    startTransition(async () => {
      const res = await saveAssessments(student.id, formattedValues);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Penilaian berhasil disimpan");
        router.push("/penilaian");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Back link */}
      <button
        onClick={() => router.push("/penilaian")}
        className="flex items-center gap-2 text-sm hover:text-blue-500 transition-colors"
        style={{ color: "var(--muted-foreground)" }}
      >
        <ArrowLeft className="w-4 h-4" /> Kembali ke Data Penilaian
      </button>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
          Input Penilaian Siswa
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Silakan masukkan nilai siswa sesuai kriteria yang ada (Skala 0-100)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Details Card */}
        <div className="p-6 rounded-2xl md:col-span-1 h-fit" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 pb-4 mb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Detail Siswa</h4>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>SMK KGB 2 Bekasi</p>
            </div>
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <span className="block text-xs" style={{ color: "var(--muted-foreground)" }}>Nama Siswa</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{student.nama}</span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: "var(--muted-foreground)" }}>NIS</span>
              <span className="font-mono text-xs font-semibold badge badge-primary">{student.nis}</span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: "var(--muted-foreground)" }}>Kelas / Jurusan</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{student.kelas} ({student.jurusan})</span>
            </div>
            <div>
              <span className="block text-xs" style={{ color: "var(--muted-foreground)" }}>Tahun Ajaran</span>
              <span className="font-semibold" style={{ color: "var(--foreground)" }}>{student.tahunAjaran}</span>
            </div>
          </div>
        </div>

        {/* Input Form Card */}
        <div className="p-6 rounded-2xl md:col-span-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3 pb-4 mb-6" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
              <ClipboardList className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Form Penilaian Kriteria</h4>
              <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Ubah nilai masing-masing kriteria di bawah ini</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {criterias.map((c) => (
              <div key={c.id} className="space-y-2 p-4 rounded-xl border transition-all" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)" }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs badge badge-primary font-bold">{c.kode}</span>
                    <span className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>{c.nama}</span>
                  </div>
                  <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    Bobot: <strong>{c.bobot}%</strong> | Tipe: <strong>{c.tipe}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="any"
                    value={scores[c.id] === 0 && scores[c.id] !== existingAssessments.find((a) => a.criteriaId === c.id)?.nilai ? "" : scores[c.id]}
                    onChange={(e) => handleScoreChange(c.id, e.target.value)}
                    placeholder="Masukkan nilai 0-100..."
                    className="form-input flex-1"
                  />
                  <div className="w-20 text-center text-xs font-mono font-bold py-2 px-3 rounded-lg border bg-slate-50 dark:bg-slate-800" style={{ borderColor: "var(--border)" }}>
                    {scores[c.id]} / 100
                  </div>
                </div>

                {/* Score guide */}
                <div className="flex items-center gap-1.5 text-[11px]" style={{ color: "var(--muted-foreground)" }}>
                  <Info className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                  <span>
                    Range 0 s/d 100. Contoh: 85.5 atau 90.
                  </span>
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-end gap-2" style={{ borderTop: "1px solid var(--border)" }}>
              <button
                type="button"
                onClick={() => router.push("/penilaian")}
                className="btn btn-secondary"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="btn btn-primary"
              >
                <Save className="w-4 h-4" />
                {isPending ? "Menyimpan..." : "Simpan Penilaian"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
