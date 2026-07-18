"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/actions/user";
import { User, Key, Lock, UserCircle, BadgeCheck, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

type UserProfile = {
  id: string;
  username: string;
  nama: string;
  role: string;
};

export default function ProfilClient({
  profile,
}: {
  profile: UserProfile;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Profile fields
  const [nama, setNama] = useState(profile.nama);
  
  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama.trim()) {
      toast.error("Nama lengkap tidak boleh kosong");
      return;
    }

    const formData = new FormData();
    formData.append("nama", nama);

    startTransition(async () => {
      const res = await updateProfile(profile.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Profil berhasil diperbarui!");
        router.refresh();
      }
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Semua field kata sandi wajib diisi");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Kata sandi baru minimal 6 karakter");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok");
      return;
    }

    const formData = new FormData();
    formData.append("nama", nama); // Required by updateProfile API
    formData.append("currentPassword", currentPassword);
    formData.append("newPassword", newPassword);

    startTransition(async () => {
      const res = await updateProfile(profile.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Kata sandi berhasil diubah!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        router.refresh();
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Pengaturan Profil</h1>
        <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
          Kelola informasi profil dan kata sandi akun Anda
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Profile Card Summary */}
        <div className="p-6 rounded-2xl md:col-span-1 h-fit flex flex-col items-center text-center justify-center relative overflow-hidden" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
          <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-blue-500/5 blur-xl" />
          
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-md bg-gradient-to-br from-[#1e3a5f] to-[#2563eb]">
            {profile.nama[0]?.toUpperCase() || "U"}
          </div>

          <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>{profile.nama}</h3>
          <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>@{profile.username}</p>

          <div className="mt-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}>
            {profile.role === "ADMIN" ? (
              <>
                <BadgeCheck className="w-4 h-4 text-amber-500" />
                <span className="text-amber-600 dark:text-amber-500">Administrator</span>
              </>
            ) : (
              <>
                <UserCircle className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-500">Guru</span>
              </>
            )}
          </div>
        </div>

        {/* Edit Forms Panel */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Form Personal Info */}
          <div className="p-6 rounded-2xl space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <User className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Informasi Pribadi</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Username / ID Pengguna</label>
                <input
                  type="text"
                  disabled
                  value={profile.username}
                  className="form-input bg-slate-50 dark:bg-slate-800 cursor-not-allowed opacity-60 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Nama Lengkap Anda..."
                  className="form-input font-medium"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary"
                >
                  {isPending ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>

          {/* Form Security / Password */}
          <div className="p-6 rounded-2xl space-y-4" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 pb-3 border-b" style={{ borderColor: "var(--border)" }}>
              <Key className="w-5 h-5 text-red-500" />
              <h3 className="font-bold text-sm" style={{ color: "var(--foreground)" }}>Ganti Kata Sandi</h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Kata Sandi Saat Ini</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan kata sandi lama..."
                    className="form-input pl-10 pr-10"
                    style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 karakter"
                      className="form-input pl-10 pr-10"
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--muted-foreground)" }}>Konfirmasi Kata Sandi Baru</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ulangi kata sandi baru"
                      className="form-input pl-10 pr-10"
                      style={{ paddingLeft: "2.5rem", paddingRight: "2.5rem" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-danger"
                >
                  {isPending ? "Mengubah Sandi..." : "Ubah Kata Sandi"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
