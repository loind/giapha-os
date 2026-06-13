"use client";

import config from "@/app/config";
import Footer from "@/components/Footer";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/utils/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Mail,
  Shield,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname === config.demoDomain) {
        setIsDemo(true);
        setEmail("giaphaos@homielab.com");
        setPassword("giaphaos");
      }
    }
  }, []);

  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [isLogin, setIsLogin] = useState(true);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = (field: string, value: string) => {
    const errors: typeof fieldErrors = { ...fieldErrors };
    switch (field) {
      case "email":
        if (!value) errors.email = "Email là bắt buộc";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          errors.email = "Email không hợp lệ";
        else delete errors.email;
        break;
      case "password":
        if (!value) errors.password = "Mật khẩu là bắt buộc";
        else if (value.length < 6)
          errors.password = "Mật khẩu ít nhất 6 ký tự";
        else delete errors.password;
        break;
      case "confirmPassword":
        if (!isLogin && value !== password)
          errors.confirmPassword = "Mật khẩu xác nhận không khớp";
        else delete errors.confirmPassword;
        break;
    }
    setFieldErrors(errors);
  };

  const handleBlur = (field: string, value: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
    validateField(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
        } else {
          router.push("/dashboard");
          router.refresh();
        }
      } else {
        if (password !== confirmPassword) {
          setError("Mật khẩu xác nhận không khớp.");
          setLoading(false);
          return;
        }

        // 1. Try to sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          // Check if error is related to missing database schema/tables
          if (
            error.message.includes("relation") &&
            error.message.includes("does not exist")
          ) {
            router.push("/setup");
            return;
          }

          setError(error.message);
        } else if (data.user?.identities && data.user.identities.length === 0) {
          setError(
            "Email này đã được đăng ký. Vui lòng đăng nhập hoặc dùng email khác.",
          );
        } else {
          if (data.session) {
            router.push("/dashboard");
            router.refresh();
          } else {
            // Attempt to sign in immediately (catches auto-confirmed first admin)
            const { data: signInData, error: signInError } =
              await supabase.auth.signInWithPassword({
                email,
                password,
              });

            if (!signInError && signInData.session) {
              router.push("/dashboard");
              router.refresh();
            } else {
              setSuccessMessage(
                "Đăng ký thành công! Vui lòng chờ admin kích hoạt tài khoản để xem nội dung.",
              );
              setIsLogin(true); // Switch back to login view
              setConfirmPassword(""); // clear confirm password
              setPassword(""); // clear password
            }
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafaf9] select-none selection:bg-amber-200 selection:text-amber-900 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_-30%,#fef3c7,transparent)] pointer-events-none"></div>

      <div className="absolute top-0 inset-x-0 h-screen overflow-hidden pointer-events-none flex justify-center">
        <div className="absolute top-[-10%] right-[-5%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-amber-300/20 rounded-full blur-[100px] mix-blend-multiply" />
        <div className="absolute bottom-[0%] left-[-10%] w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-rose-200/20 rounded-full blur-[120px] mix-blend-multiply" />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10 w-full">
        <motion.div
          className="max-w-md w-full bg-white/70 backdrop-blur-xl p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80 relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-[100px] pointer-events-none"></div>

          <div className="text-center mb-8 relative z-10">
            <Link
              href="/"
              className="inline-flex items-center justify-center p-3.5 bg-white rounded-2xl mb-5 shadow-sm ring-1 ring-stone-100 hover:scale-105 hover:shadow-md transition-all duration-300"
            >
              <Shield className="size-8 text-amber-600" />
            </Link>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              {isLogin ? "Đăng nhập" : "Đăng ký"}
            </h2>
            <p className="mt-3 text-sm text-stone-500 font-medium tracking-wide">
              {isLogin
                ? "Đăng nhập để truy cập gia phả."
                : "Tạo tài khoản thành viên mới."}
            </p>
            {isDemo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-amber-50 border border-amber-200/60 rounded-xl"
              >
                <p className="text-[13px] font-semibold text-amber-800">
                  Website Demo. Dữ liệu đều không có thật.
                </p>
              </motion.div>
            )}
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative">
                <label
                  htmlFor="email-address"
                  className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                >
                  Email
                </label>
                <div className="relative flex items-center group">
                  <Mail className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={`bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border ${fieldErrors.email && touchedFields.has("email") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-stone-200/80 focus:border-amber-400 focus:ring-amber-400"} shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none`}
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email", email)}
                  />
                </div>
                {fieldErrors.email && touchedFields.has("email") && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1" role="alert">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="relative">
                <label
                  htmlFor="password"
                  className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                >
                  Mật khẩu
                </label>
                <div className="relative flex items-center group">
                  <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    required
                    className={`bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border ${fieldErrors.password && touchedFields.has("password") ? "border-red-300 focus:border-red-400 focus:ring-red-400" : "border-stone-200/80 focus:border-amber-400 focus:ring-amber-400"} shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:bg-white pl-11 pr-12 py-3.5 transition-all duration-200 outline-none`}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => handleBlur("password", password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 p-1 text-stone-400 hover:text-stone-600 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center rounded"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {fieldErrors.password && touchedFields.has("password") && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 font-medium ml-1" role="alert">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {isLogin && (
                <div className="text-right -mt-2">
                  <a
                    href="mailto:giaphaos@homielab.com?subject=Quên mật khẩu"
                    className="text-xs text-amber-700 hover:text-amber-600 font-medium transition-colors"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
              )}

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.3 }}
                    className="relative overflow-hidden"
                  >
                    <label
                      htmlFor="confirmPassword"
                      className="block text-[13px] font-semibold text-stone-600 mb-1.5 ml-1"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="relative flex items-center group">
                      <KeyRound className="absolute left-3.5 size-5 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required={!isLogin}
                        className="bg-white/50 text-stone-900 placeholder-stone-400 block w-full rounded-xl border border-stone-200/80 shadow-[0_2px_10px_-3px_rgba(0,0,0,0.05)] focus:border-amber-400 focus:ring-amber-400 focus:bg-white pl-11 pr-4 py-3.5 transition-all duration-200 outline-none"
                        placeholder="Nhập lại mật khẩu"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="text-red-700 text-[13px] text-center bg-red-50 p-3 rounded-xl border border-red-100/50 font-medium"
                >
                  {error}
                </motion.div>
              )}

              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="text-teal-700 text-[13px] text-center bg-teal-50 p-3 rounded-xl border border-teal-100/50 font-medium"
                >
                  {successMessage}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center gap-2 py-4 px-4 text-[15px] font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 border border-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-70 disabled:cursor-wait transition-all duration-300 shadow-xl shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center gap-2.5">
                    <svg
                      className="animate-spin -ml-1 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </span>
                ) : (
                  <>
                    {isLogin ? "Đăng nhập" : "Tạo tài khoản"}
                    {!isLogin && <UserPlus className="size-4 ml-1" />}
                  </>
                )}
              </button>

              <div className="relative flex items-center py-2 opacity-60">
                <div className="grow border-t border-stone-200"></div>
                <span className="shrink-0 mx-4 text-stone-400 text-[11px] uppercase tracking-wider font-bold">
                  Hoặc
                </span>
                <div className="grow border-t border-stone-200"></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isLogin && isDemo) {
                    setError(
                      "Đây là trang demo, bạn không cần phải tạo tài khoản. Hãy sử dụng tài khoản demo để truy cập với toàn bộ quyền.",
                    );
                    return;
                  }
                  setIsLogin(!isLogin);
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="w-full text-sm font-semibold text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/80 py-3.5 rounded-xl shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] focus:outline-none transition-all duration-200"
              >
                {isLogin
                  ? "Chưa có tài khoản? Đăng ký ngay"
                  : "Đã có tài khoản? Đăng nhập"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-stone-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 group bg-white/60 px-5 py-2.5 rounded-full shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-transform" />
        Trang chủ
      </Link>

      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
        <Link
          href="/about"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-semibold text-sm transition-all duration-300 group bg-white/60 px-4 py-2.5 rounded-full shadow-sm border border-stone-200 hover:border-stone-300 hover:shadow-md min-h-[44px]"
        >
          <Info className="size-4 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Giới thiệu</span>
        </Link>
        <ThemeToggle />
      </div>

      <Footer className="bg-transparent relative z-10 border-none mt-auto" />
    </div>
  );
}
