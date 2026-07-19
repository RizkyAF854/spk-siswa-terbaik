"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCriteria, updateCriteria, deleteCriteria } from "@/actions/kriteria";
import { Plus, Edit, Trash2, ListChecks, Percent, HelpCircle, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type Criteria = {
  id: string;
  kode: string;
  nama: string;
  bobot: number;
  tipe: "BENEFIT" | "COST";
};

export default function KriteriaClient({
  criterias,
  userRole,
}: {
  criterias: Criteria[];
  userRole: "ADMIN" | "GURU";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [kode, setKode] = useState("");
  const [nama, setNama] = useState("");
  const [bobot, setBobot] = useState(0);
  const [tipe, setTipe] = useState<"BENEFIT" | "COST">("BENEFIT");

  const isAdmin = userRole === "ADMIN";

  // Calculations
  const totalBobot = criterias.reduce((sum, c) => sum + c.bobot, 0);
  const benefitCount = criterias.filter((c) => c.tipe === "BENEFIT").length;
  const costCount = criterias.filter((c) => c.tipe === "COST").length;

  const resetForm = () => {
    setKode("");
    setNama("");
    setBobot(0);
    setTipe("BENEFIT");
  };

  const handleOpenAdd = () => {
    resetForm();
    // Auto-generate next code (e.g. C5 if C1-C4 exist)
    const codes = criterias.map((c) => parseInt(c.kode.replace("C", ""))).filter((num) => !isNaN(num));
    const nextNum = codes.length > 0 ? Math.max(...codes) + 1 : 1;
    setKode(`C${nextNum}`);
    setIsAddOpen(true);
  };

  const handleOpenEdit = (c: Criteria) => {
    setEditingCriteria(c);
    setKode(c.kode);
    setNama(c.nama);
    setBobot(c.bobot);
    setTipe(c.tipe);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kode || !nama || bobot <= 0) {
      toast.error("Semua field wajib diisi dengan benar");
      return;
    }

    if (totalBobot + bobot > 100) {
      toast.error(`Total bobot melebihi 100%! Maksimal sisa bobot: ${100 - totalBobot}%`);
      return;
    }

    const formData = new FormData();
    formData.append("kode", kode);
    formData.append("nama", nama);
    formData.append("bobot", bobot.toString());
    formData.append("tipe", tipe);

    startTransition(async () => {
      const res = await createCriteria(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Kriteria berhasil ditambahkan");
        setIsAddOpen(false);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCriteria) return;

    if (!kode || !nama || bobot <= 0) {
      toast.error("Semua field wajib diisi dengan benar");
      return;
    }

    const currentTotalExcludingThis = totalBobot - editingCriteria.bobot;
    if (currentTotalExcludingThis + bobot > 100) {
      toast.error(`Total bobot melebihi 100%! Maksimal sisa bobot: ${100 - currentTotalExcludingThis}%`);
      return;
    }

    const formData = new FormData();
    formData.append("kode", kode);
    formData.append("nama", nama);
    formData.append("bobot", bobot.toString());
    formData.append("tipe", tipe);

    startTransition(async () => {
      const res = await updateCriteria(editingCriteria.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Kriteria berhasil diperbarui");
        setEditingCriteria(null);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    startTransition(async () => {
      const res = await deleteCriteria(deletingId);
      if (res.success) {
        toast.success("Kriteria berhasil dihapus");
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error("Gagal menghapus kriteria");
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Data Kriteria</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Kelola kriteria penilaian untuk menentukan siswa terbaik
          </p>
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <Plus className="w-4 h-4" /> Tambah Kriteria
          </button>
        )}
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl flex items-center justify-between" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div>
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total Kriteria</p>
            <h3 className="text-3xl font-extrabold mt-1" style={{ color: "var(--foreground)" }}>{criterias.length}</h3>
            <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
              {benefitCount} Benefit | {costCount} Cost
            </p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.1), rgba(59,130,246,0.1))" }}>
            <ListChecks className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="p-6 rounded-2xl flex items-center justify-between col-span-1 sm:col-span-2 md:col-span-2" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="flex-1 mr-4">
            <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Total Akumulasi Bobot</p>
            <div className="flex items-center gap-2 mt-1">
              <h3 className="text-3xl font-extrabold" style={{ color: "var(--foreground)" }}>{totalBobot}%</h3>
              {totalBobot === 100 ? (
                <span className="badge badge-success flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid (100%)
                </span>
              ) : (
                <span className="badge badge-warning flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Belum Ideal ({100 - totalBobot}% sisa)
                </span>
              )}
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-3 rounded-full mt-4 overflow-hidden bg-slate-200 dark:bg-slate-700 relative">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalBobot === 100 ? "bg-emerald-500" : "bg-blue-500"
                }`}
                style={{ width: `${totalBobot}%` }}
              />
            </div>
            <p className="text-xs mt-2" style={{ color: "var(--muted-foreground)" }}>
              *Untuk akurasi perhitungan WP, total bobot harus tepat bernilai 100%
            </p>
          </div>
          <div className="p-4 rounded-xl flex-shrink-0" style={{ background: "linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.1))" }}>
            <Percent className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
      </div>

      {/* Warning Alert if not 100% */}
      {totalBobot !== 100 && (
        <div className="p-4 rounded-2xl flex gap-3 border" style={{ background: "rgba(245,158,11,0.05)", borderColor: "rgba(245,158,11,0.2)" }}>
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm" style={{ color: "var(--foreground)" }}>Perhatian: Akumulasi Bobot Tidak 100%</h4>
            <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>
              Akumulasi seluruh bobot kriteria saat ini adalah <strong>{totalBobot}%</strong>. Metode WP mensyaratkan normalisasi bobot di mana jumlah seluruh bobot adalah 100% (atau 1.0). Sistem akan secara otomatis menormalisasikan bobot secara relatif saat perhitungan dijalankan, namun disarankan untuk menyetel total bobot tepat 100% demi konsistensi data.
            </p>
          </div>
        </div>
      )}

      {/* Table Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Daftar Kriteria</h2>
          <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
            ORDER BY KODE
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">No</th>
                <th className="w-24">Kode</th>
                <th>Nama Kriteria</th>
                <th className="w-32">Tipe</th>
                <th className="w-48">Bobot Absolut</th>
                <th className="w-32">Visual Bobot</th>
                {isAdmin && <th className="w-24">Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {criterias.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 7 : 6} className="text-center py-12">
                    <ListChecks className="w-12 h-12 mx-auto mb-3 opacity-20" style={{ color: "var(--muted-foreground)" }} />
                    <p style={{ color: "var(--muted-foreground)" }}>Belum ada kriteria penilaian</p>
                  </td>
                </tr>
              ) : (
                criterias.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td><span className="font-mono text-xs badge badge-primary">{c.kode}</span></td>
                    <td className="font-medium" style={{ color: "var(--foreground)" }}>{c.nama}</td>
                    <td>
                      <span className={`badge ${c.tipe === "BENEFIT" ? "badge-success" : "badge-danger"}`}>
                        {c.tipe === "BENEFIT" ? "Benefit (Keuntungan)" : "Cost (Biaya)"}
                      </span>
                    </td>
                    <td className="font-semibold">{c.bobot}%</td>
                    <td>
                      <div className="w-24 h-2 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-700">
                        <div
                          className={`h-full rounded-full ${
                            c.tipe === "BENEFIT" ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${c.bobot}%` }}
                        />
                      </div>
                    </td>
                    {isAdmin && (
                      <td>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleOpenEdit(c)} className="btn btn-sm btn-secondary" title="Edit">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeletingId(c.id)} className="btn btn-sm btn-danger" title="Hapus">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tambah Kriteria Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-200">×</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Kode Kriteria</label>
                <input
                  type="text"
                  required
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  placeholder="Contoh: C1"
                  className="form-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Nama Kriteria</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Nilai Rata-rata Ujian"
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Bobot (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={bobot}
                    onChange={(e) => setBobot(parseFloat(e.target.value) || 0)}
                    placeholder="Contoh: 25"
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Tipe</label>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="BENEFIT">BENEFIT</option>
                    <option value="COST">COST</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingCriteria && (
        <div className="modal-overlay" onClick={() => setEditingCriteria(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Edit Kriteria</h3>
              <button onClick={() => setEditingCriteria(null)} className="text-slate-400 hover:text-slate-200">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Kode Kriteria</label>
                <input
                  type="text"
                  required
                  value={kode}
                  onChange={(e) => setKode(e.target.value)}
                  className="form-input"
                  disabled // Disable code modification to prevent ranking mismatch
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Nama Kriteria</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Bobot (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    value={bobot}
                    onChange={(e) => setBobot(parseFloat(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Tipe</label>
                  <select
                    value={tipe}
                    onChange={(e) => setTipe(e.target.value as any)}
                    className="form-input"
                  >
                    <option value="BENEFIT">BENEFIT</option>
                    <option value="COST">COST</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingCriteria(null)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl" style={{ background: "rgba(239,68,68,0.1)" }}>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Hapus Kriteria</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Menghapus kriteria akan menghapus semua data penilaian siswa untuk kriteria ini.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button>
              <button onClick={handleDelete} disabled={isPending} className="btn btn-danger">
                {isPending ? "Menghapus..." : "Hapus Permanen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
