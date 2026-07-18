"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import {
  Lock,
  User,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
  LogIn,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";

const LogoSVG = () => (
  <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto mb-2" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Stars at the top */}
    <g transform="translate(0, 0)">
      {/* Middle Gold Star */}
      <path d="M60 12 L62 16 L66.5 16.5 L63 19.5 L64 24 L60 21.5 L56 24 L57 19.5 L53.5 16.5 L58 16 Z" fill="#F59E0B" />
      {/* Left stars */}
      <path d="M49 14.5 L50.5 18 L54 18.3 L51.2 20.8 L52 24.5 L49 22.5 L46 24.5 L46.8 20.8 L44 18.3 L47.5 18 Z" fill="#1E3A8A" opacity="0.6" />
      <path d="M39 19 L40.2 22 L43 22.2 L40.8 24.2 L41.5 27.2 L39 25.5 L36.5 27.2 L37.2 24.2 L35 22.2 L37.8 22 Z" fill="#1E3A8A" opacity="0.4" />
      {/* Right stars */}
      <path d="M71 14.5 L72.5 18 L76 18.3 L73.2 20.8 L74 24.5 L71 22.5 L68 24.5 L68.8 20.8 L66 18.3 L69.5 18 Z" fill="#1E3A8A" opacity="0.6" />
      <path d="M81 19 L82.2 22 L85 22.2 L82.8 24.2 L83.5 27.2 L81 25.5 L78.5 27.2 L79.2 24.2 L77 22.2 L79.8 22 Z" fill="#1E3A8A" opacity="0.4" />
    </g>

    {/* Double circular borders */}
    <circle cx="60" cy="65" r="32" stroke="#1E3A8A" strokeWidth="1.5" strokeDasharray="3 2" />
    <circle cx="60" cy="65" r="29" stroke="#1E3A8A" strokeWidth="1" />
    <circle cx="60" cy="65" r="26" fill="#1E3A8A" />

    {/* Shield */}
    <path d="M60 49 C65 49 70 46.5 70 46.5 C70 46.5 70 65 60 74 C50 65 50 46.5 50 46.5 C50 46.5 55 49 60 49 Z" fill="#FFFFFF" stroke="#1D4ED8" strokeWidth="1.5" />

    {/* Graduation Cap inside the Shield */}
    {/* Rhombus (top of cap) */}
    <path d="M60 52 L67 55 L60 58 L53 55 Z" fill="#1E3A8A" />
    {/* Cap base */}
    <path d="M56 57 L56 61 C56 62.2 57.5 63 60 63 C62.5 63 64 62.2 64 61 L64 57" fill="#1E3A8A" />
    {/* Tassel */}
    <path d="M60 55 L65 59 L65 61" stroke="#F59E0B" strokeWidth="0.8" strokeLinecap="round" />
    <circle cx="65" cy="61" r="1" fill="#F59E0B" />

    {/* Open Book underneath the cap */}
    <path d="M53 66 C56 64.5 59 66 60 67 C61 66 64 64.5 67 66 L67 70 C64 68.5 61 70 60 71 C59 70 56 68.5 53 70 Z" fill="#FFFFFF" stroke="#1E3A8A" strokeWidth="0.8" />
    <line x1="60" y1="67" x2="60" y2="71" stroke="#1E3A8A" strokeWidth="0.8" />

    {/* Laurel wreaths around the emblem */}
    <path d="M22 65 C22 47 38 33 38 33" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    <path d="M98 65 C98 47 82 33 82 33" stroke="#1E3A8A" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    
    {/* Ribbon at the bottom */}
    <path d="M42 84 L48 81 L72 81 L78 84 L72 87 L48 87 Z" fill="#1E3A8A" />
    <text x="60" y="85.5" fill="#FFFFFF" fontSize="4.5" fontWeight="bold" textAnchor="middle">SMK KGB 2</text>
  </svg>
);

export default function LoginPage() {
  const router = useRouter();

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState<"ADMIN" | "GURU">("ADMIN");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("login-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("login-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("login-theme", "light");
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoginLoading(true);

    try {
      const result = await signIn("credentials", {
        username: loginUsername,
        password: loginPassword,
        role: loginRole,
        redirect: false,
      });

      if (result?.error) {
        setLoginError("Username atau password salah!");
        toast.error("Gagal Masuk: Username atau password salah!");
        setIsLoginLoading(false);
      } else {
        toast.success("Berhasil masuk! Mengalihkan ke Dashboard...");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setLoginError("Terjadi kesalahan sistem.");
      toast.error("Kesalahan Sistem: Gagal melakukan autentikasi.");
      setIsLoginLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-between py-12 px-4 sm:px-6 lg:px-8 relative font-sans transition-colors duration-300 ${isDark ? "bg-zinc-950" : "bg-[#f0f4f9]"}`}>
      {/* Dark Mode Toggle Button */}
      <button
        onClick={toggleDarkMode}
        className={`absolute top-5 right-5 z-20 p-2.5 rounded-full border transition-all duration-300 shadow-md hover:scale-110 cursor-pointer ${
          isDark
            ? "bg-zinc-800 border-zinc-700 text-amber-400 hover:bg-zinc-700 hover:shadow-amber-500/20"
            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:shadow-lg"
        }`}
        aria-label="Toggle dark mode"
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="max-w-[420px] w-full mx-auto my-auto space-y-4">
        {/* Login Card */}
        <div className={`border rounded-[24px] p-8 sm:p-10 w-full transition-colors duration-300 ${
          isDark
            ? "bg-zinc-900 border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.3)]"
            : "bg-white border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)]"
        }`}>
          {/* Logo */}
          <LogoSVG />

          {/* Titles */}
          <div className="text-center mb-6">
            <p className={`text-[13px] font-medium tracking-wide mb-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Sistem Pendukung Keputusan
            </p>
            <h1 className={`text-2xl font-bold tracking-tight mb-1 ${isDark ? "text-zinc-100" : "text-[#0e1e46]"}`}>
              Penentuan Siswa Terbaik
            </h1>
            <p className={`text-[13px] font-semibold mb-6 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Metode Weighted Product
            </p>
            <p className={`text-xs ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
              Silakan login untuk melanjutkan
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className={`flex items-center gap-2 rounded-xl border p-3 text-xs ${
                isDark
                  ? "border-red-800 bg-red-950/50 text-red-400"
                  : "border-red-200 bg-red-50/50 text-red-700"
              }`}>
                <AlertCircle className={`h-4 w-4 shrink-0 ${isDark ? "text-red-400" : "text-red-500"}`} />
                <span>{loginError}</span>
              </div>
            )}

            {/* Username Field */}
            <div className="relative">
              <User className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
              <input
                type="text"
                placeholder="Username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
                }`}
                required
                disabled={isLoginLoading}
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-zinc-500" : "text-slate-400"}`} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className={`w-full pl-10 pr-10 py-3 rounded-xl border text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all ${
                  isDark
                    ? "border-zinc-700 bg-zinc-800 text-zinc-200 placeholder:text-zinc-500"
                    : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400"
                }`}
                required
                disabled={isLoginLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none ${
                  isDark ? "text-zinc-500 hover:text-zinc-300" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Role Selection */}
            <div className="space-y-1 pt-1">
              <p className={`text-xs font-bold ${isDark ? "text-zinc-300" : "text-slate-700"}`}>Pilih Role</p>
              <div className="flex items-center gap-6">
                <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="ADMIN"
                    checked={loginRole === "ADMIN"}
                    onChange={() => setLoginRole("ADMIN")}
                    className={`w-4 h-4 text-blue-600 focus:ring-blue-500 ${isDark ? "border-zinc-600" : "border-slate-300"}`}
                    disabled={isLoginLoading}
                  />
                  Admin
                </label>
                <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold ${isDark ? "text-zinc-300" : "text-slate-700"}`}>
                  <input
                    type="radio"
                    name="role"
                    value="GURU"
                    checked={loginRole === "GURU"}
                    onChange={() => setLoginRole("GURU")}
                    className={`w-4 h-4 text-blue-600 focus:ring-blue-500 ${isDark ? "border-zinc-600" : "border-slate-300"}`}
                    disabled={isLoginLoading}
                  />
                  Guru
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full font-bold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg text-sm flex items-center justify-center gap-2 mt-4 text-white ${
                isDark
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-[#2a62d8] hover:bg-[#1e4eb8]"
              }`}
              disabled={isLoginLoading}
            >
              {isLoginLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Memvalidasi...
                </>
              ) : (
                <>
                  Masuk
                  <LogIn className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Links for Demo & Register */}
          <div className={`mt-5 pt-3 border-t flex flex-col gap-2.5 text-center ${isDark ? "border-zinc-800" : "border-slate-100"}`}>
            <Link
              href="/register"
              className={`text-xs font-semibold hover:underline transition-colors ${
                isDark ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"
              }`}
            >
              Belum punya akun? Daftar
            </Link>
            <div className={`p-2.5 rounded-xl border ${
              isDark ? "bg-zinc-800/50 border-zinc-700" : "bg-slate-50 border-slate-100"
            }`}>
              <span className={`text-[9px] font-bold uppercase tracking-wider block mb-1 ${isDark ? "text-zinc-500" : "text-slate-400"}`}>
                Kredensial Demo
              </span>
              <div className={`flex gap-4 justify-center text-[9px] font-mono font-bold ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                <span>Admin: admin / admin123</span>
                <span>Guru: guru / guru123</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className={`text-center text-[11px] mt-6 relative z-10 ${isDark ? "text-zinc-600" : "text-slate-400"}`}>
        <p>© 2024 SPK Siswa Terbaik. All rights reserved.</p>
      </div>
    </div>
  );
}

