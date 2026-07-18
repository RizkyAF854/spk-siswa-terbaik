"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser, deleteUser } from "@/actions/user";
import { Plus, Edit, Trash2, Shield, User, Key, Mail, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";


type UserType = {
  id: string;
  username: string;
  nama: string;
  role: "ADMIN" | "GURU";
  plainPassword?: string | null;
  createdAt: Date;
};

export default function PenggunaClient({
  users,
  currentUserId,
}: {
  users: UserType[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [nama, setNama] = useState("");
  const [role, setRole] = useState<"ADMIN" | "GURU">("GURU");
  const [password, setPassword] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };



  const resetForm = () => {
    setUsername("");
    setNama("");
    setRole("GURU");
    setPassword("");
    setShowFormPassword(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleOpenEdit = (u: UserType) => {
    setEditingUser(u);
    setUsername(u.username);
    setNama(u.nama);
    setRole(u.role);
    setPassword(""); // Keep password blank unless updating
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !nama || !password) {
      toast.error("Semua field wajib diisi");
      return;
    }

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("nama", nama);
    formData.append("role", role);
    formData.append("password", password);

    startTransition(async () => {
      const res = await createUser(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Pengguna baru berhasil ditambahkan");
        setIsAddOpen(false);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!username || !nama) {
      toast.error("Nama dan Username wajib diisi");
      return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("nama", nama);
    formData.append("role", role);
    if (password) {
      if (password.length < 6) {
        toast.error("Password baru minimal 6 karakter");
        return;
      }
      formData.append("password", password);
    }

    startTransition(async () => {
      const res = await updateUser(editingUser.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Pengguna berhasil diperbarui");
        setEditingUser(null);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    if (deletingId === currentUserId) {
      toast.error("Anda tidak dapat menghapus akun Anda sendiri!");
      setDeletingId(null);
      return;
    }

    startTransition(async () => {
      const res = await deleteUser(deletingId);
      if (res.success) {
        toast.success("Pengguna berhasil dihapus");
        setDeletingId(null);
        router.refresh();
      } else {
        toast.error("Gagal menghapus pengguna");
      }
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Manajemen Pengguna</h1>
          <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
            Kelola hak akses dan akun pengguna aplikasi SPK Siswa Terbaik
          </p>
        </div>
        <button onClick={handleOpenAdd} className="btn btn-primary">
          <Plus className="w-4 h-4" /> Tambah Pengguna
        </button>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
        <div className="p-5 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
          <h2 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Daftar Pengguna</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-16">No</th>
                <th>Nama Lengkap</th>
                <th>Username</th>
                <th className="w-40">Password</th>
                <th className="w-32">Role</th>
                <th className="w-48">Tanggal Pembuatan</th>
                <th className="w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td className="font-medium" style={{ color: "var(--foreground)" }}>{u.nama}</td>
                  <td><span className="font-mono text-xs badge badge-primary">{u.username}</span></td>
                  <td>
                    <div className="flex items-center gap-2 font-mono text-xs">
                      {u.plainPassword ? (
                        <>
                          <span style={{ color: "var(--foreground)" }}>
                            {visiblePasswords[u.id] ? u.plainPassword : "••••••"}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(u.id)}
                            className="text-slate-400 hover:text-slate-200 transition-colors p-1"
                            title={visiblePasswords[u.id] ? "Sembunyikan Password" : "Lihat Password"}
                          >
                            {visiblePasswords[u.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </>
                      ) : (
                        <span className="text-zinc-500 italic text-[11px]">(Belum di-update)</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${u.role === "ADMIN" ? "badge-warning" : "badge-success"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleOpenEdit(u)} className="btn btn-sm btn-secondary" title="Edit">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(u.id)}
                        disabled={u.id === currentUserId}
                        className="btn btn-sm btn-danger"
                        title={u.id === currentUserId ? "Tidak dapat menghapus diri sendiri" : "Hapus"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="modal-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Tambah Pengguna Baru</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-200">×</button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value.replace(/[0-9]/g, ""))}
                    placeholder="Contoh: Budi Gunawan, S.Pd"
                    className="form-input pl-10"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: budi123"
                    className="form-input pl-10"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showFormPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="form-input pl-10 pr-10"
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Role Akses</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="form-input pl-10"
                      style={{ paddingLeft: "2.5rem" }}
                    >
                      <option value="GURU">GURU</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
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
      {editingUser && (
        <div className="modal-overlay" onClick={() => setEditingUser(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg" style={{ color: "var(--foreground)" }}>Edit Pengguna</h3>
              <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-200">×</button>
            </div>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nama}
                    onChange={(e) => setNama(e.target.value.replace(/[0-9]/g, ""))}
                    className="form-input pl-10"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Username</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input pl-10"
                    style={{ paddingLeft: "2.5rem" }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Ganti Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showFormPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kosongkan jika tidak diganti"
                      className="form-input pl-10 pr-10 text-xs"
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showFormPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Role Akses</label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as any)}
                      className="form-input pl-10"
                      style={{ paddingLeft: "2.5rem" }}
                      disabled={editingUser.id === currentUserId} // Prevent changing own role (locking yourself out)
                    >
                      <option value="GURU">GURU</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2">
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">Batal</button>
                <button type="submit" disabled={isPending} className="btn btn-primary">
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deletingId && (
        <div className="modal-overlay" onClick={() => setDeletingId(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-red-500/10">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>Hapus Akun Pengguna</h3>
                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                  Akun ini akan dihapus permanen dan tidak dapat digunakan untuk masuk lagi.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setDeletingId(null)} className="btn btn-secondary">Batal</button>
              <button onClick={handleDelete} disabled={isPending} className="btn btn-danger">
                {isPending ? "Menghapus..." : "Ya, Hapus Akun"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
