"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateStudent } from "@/actions/siswa";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

type Student = {
  id: string;
  nis: string;
  nama: string;
  jenisKelamin: string;
  kelas: string;
  jurusan: string;
  tahunAjaran: string;
};

export default function EditSiswaForm({ student }: { student: Student }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateStudent(student.id, formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else {
        toast.success("Data siswa berhasil diperbarui");
        router.push("/siswa");
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link href="/siswa" className="btn btn-secondary btn-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Edit Siswa</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Perbarui data siswa {student.nama}</p>
        </div>
      </div>

      <div className="rounded-2xl p-6" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        {error && (
          <div className="mb-4 p-3 rounded-lg text-sm text-red-500" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>NIS</label>
              <input name="nis" required defaultValue={student.nis} className="form-input" inputMode="numeric" onInput={(e) => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/[^0-9]/g, ""); }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Nama Siswa</label>
              <input name="nama" required defaultValue={student.nama} className="form-input" onInput={(e) => { const input = e.target as HTMLInputElement; input.value = input.value.replace(/[0-9]/g, ""); }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Jenis Kelamin</label>
              <select name="jenisKelamin" required defaultValue={student.jenisKelamin} className="form-input">
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Kelas</label>
              <select name="kelas" required defaultValue={student.kelas} className="form-input">
                <option value="X TKJ 1">X TKJ 1</option>
                <option value="X TKJ 2">X TKJ 2</option>
                <option value="X TKJ 3">X TKJ 3</option>
                <option value="XI TKJ 1">XI TKJ 1</option>
                <option value="XI TKJ 2">XI TKJ 2</option>
                <option value="XI TKJ 3">XI TKJ 3</option>
                <option value="XII TKJ 1">XII TKJ 1</option>
                <option value="XII TKJ 2">XII TKJ 2</option>
                <option value="XII TKJ 3">XII TKJ 3</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Jurusan</label>
              <input name="jurusan" required defaultValue={student.jurusan} readOnly className="form-input" style={{ background: "var(--muted)" }} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "var(--foreground)" }}>Tahun Ajaran</label>
              <select name="tahunAjaran" required defaultValue={student.tahunAjaran} className="form-input">
                <option value="2025/2026">2025/2026</option>
                <option value="2024/2025">2024/2025</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/siswa" className="btn btn-secondary">Batal</Link>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</> : <><Save className="w-4 h-4" /> Simpan</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
