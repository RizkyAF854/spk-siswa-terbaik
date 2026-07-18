"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createUser } from "@/actions/user";
import { toast } from "sonner";
import {
  GraduationCap,
  Lock,
  User,
  Mail,
  FileText,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [regNama, setRegNama] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regNuptk, setRegNuptk] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"ADMIN" | "GURU">("GURU");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!regNama || !regEmail || !regNuptk || !regPassword || !regConfirmPassword) {
      toast.error("Silakan lengkapi semua bidang registrasi!");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      toast.error("Konfirmasi password tidak cocok!");
      return;
    }

    if (regPassword.length < 6) {
      toast.error("Password minimal harus 6 karakter!");
      return;
    }

    const formData = new FormData();
    formData.append("nama", regNama);
    formData.append("username", regEmail);
    formData.append("role", regRole);
    formData.append("password", regPassword);
    formData.append("nuptk", regNuptk);

    startTransition(async () => {
      const res = await createUser(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Registrasi berhasil! Silakan masuk menggunakan akun Anda.");
        router.push("/login");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-950 font-sans flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full opacity-40 pointer-events-none z-0">
        <div className="absolute top-12 left-12 w-72 h-72 bg-indigo-400 rounded-full filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 right-12 w-96 h-96 bg-blue-300 rounded-full filter blur-3xl opacity-30 animate-pulse delay-700" />
      </div>

      <div className="max-w-3xl w-full mx-auto space-y-8 relative z-10 my-auto">
        {/* Logo / Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1e3a5f] text-white shadow-xl shadow-blue-900/10 hover:scale-105 transition-transform duration-300">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-[#1e3a5f] tracking-tight">
            Daftar Akun Baru
          </h1>
          <p className="text-sm text-zinc-500 font-medium">
            SMK Karya Guna Bhakti 2 Kota Bekasi — Sistem Informasi Manajemen Sekolah
          </p>
        </div>

        {/* Register Card */}
        <Card className="bg-white border-zinc-200/80 shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="bg-zinc-50 border-b border-zinc-100 p-6 space-y-2">
            <CardTitle className="text-xl font-bold text-[#1e3a5f]">
              Formulir Pendaftaran
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs">
              Buat akun staf administrasi atau guru baru Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleRegisterSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              
              {/* Nama Lengkap */}
              <div className="space-y-2">
                <Label htmlFor="reg-nama" className="text-zinc-700 text-xs font-bold uppercase tracking-wider">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="reg-nama"
                    type="text"
                    placeholder="Contoh: Budi Gunawan, S.Pd"
                    value={regNama}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[0-9]/g, "");
                      setRegNama(value);
                    }}
                    className="pl-10 border-zinc-200 bg-white focus:border-[#1e3a5f] text-sm py-5 rounded-xl transition-all"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-zinc-700 text-xs font-bold uppercase tracking-wider">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="Contoh: budi@gmail.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="pl-10 border-zinc-200 bg-white focus:border-[#1e3a5f] text-sm py-5 rounded-xl transition-all"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* NUPTK / ID Pegawai */}
              <div className="space-y-2">
                <Label htmlFor="reg-nuptk" className="text-zinc-700 text-xs font-bold uppercase tracking-wider">
                  NUPTK / ID Pegawai
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="reg-nuptk"
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukkan 16 digit NUPTK"
                    value={regNuptk}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, "");
                      setRegNuptk(value);
                    }}
                    maxLength={16}
                    className="pl-10 border-zinc-200 bg-white focus:border-[#1e3a5f] text-sm py-5 rounded-xl transition-all"
                    required
                    disabled={isPending}
                  />
                </div>
              </div>

              {/* Role Selector (Radio buttons) */}
              <div className="space-y-2">
                <Label className="text-zinc-700 text-xs font-bold uppercase tracking-wider block">
                  Pilih Peran Pendaftaran
                </Label>
                <div className="flex gap-6 mt-1 bg-zinc-50 p-3 rounded-xl border border-zinc-150 h-[50px] items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
                    <input
                      type="radio"
                      name="reg-role"
                      checked={regRole === "GURU"}
                      onChange={() => setRegRole("GURU")}
                      className="h-4 w-4 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      disabled={isPending}
                    />
                    Guru
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
                    <input
                      type="radio"
                      name="reg-role"
                      checked={regRole === "ADMIN"}
                      onChange={() => setRegRole("ADMIN")}
                      className="h-4 w-4 text-[#1e3a5f] focus:ring-[#1e3a5f]"
                      disabled={isPending}
                    />
                    Administrator
                  </label>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-pass" className="text-zinc-700 text-xs font-bold uppercase tracking-wider">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="reg-pass"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 karakter"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="pl-10 pr-10 border-zinc-200 bg-white focus:border-[#1e3a5f] text-sm py-5 rounded-xl transition-all"
                    required
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-confirm" className="text-zinc-700 text-xs font-bold uppercase tracking-wider">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  <Input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Ulangi password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 border-zinc-200 bg-white focus:border-[#1e3a5f] text-sm py-5 rounded-xl transition-all"
                    required
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Register Button */}
              <div className="md:col-span-2 mt-2">
                <Button
                  type="submit"
                  className="w-full bg-[#1e3a5f] hover:bg-[#152943] text-white font-bold py-5 rounded-xl transition-all shadow-md hover:shadow-lg text-sm"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftarkan Akun...
                    </>
                  ) : (
                    "Daftarkan Akun Baru"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-zinc-100 p-6 text-center">
            <Link
              href="/login"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Sudah punya akun? Masuk di sini
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-zinc-400 mt-12 relative z-10 space-y-1">
        <p>© 2026 SMK Karya Guna Bhakti 2. Hak Cipta Dilindungi.</p>
        <p className="text-[10px]">Sistem Evaluasi Multi-Kriteria Keputusan Siswa Berprestasi Metode WP</p>
      </div>
    </div>
  );
}
