import Link from "next/link";
import { ArrowRight, Shield, Server } from "lucide-react";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
  );
}

export default function LandingCTA() {
  return (
    <section className="w-full relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-stone-50 to-orange-50 dark:from-amber-900/10 dark:via-stone-900 dark:to-orange-900/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[24px_24px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Bắt đầu lưu giữ gia phả dòng họ
        </h2>
        <p className="mt-6 text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
          Mã nguồn mở, tự lưu trữ, bảo mật tuyệt đối. Dữ liệu thuộc về bạn,
          không phải của bất kỳ công ty nào.
        </p>

        {/* CTA buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/login"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xl shadow-amber-900/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] w-full sm:w-auto min-h-[56px]"
          >
            <span className="flex items-center gap-3">
              Truy cập ngay
              <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <a
            href="https://github.com/homielab/giapha-os"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-stone-700 dark:text-stone-300 bg-white/70 hover:bg-white dark:bg-stone-800/70 dark:hover:bg-stone-800 border border-stone-200 hover:border-stone-300 dark:border-stone-700 rounded-xl transition-all duration-300 w-full sm:w-auto min-h-[56px] backdrop-blur-sm"
          >
            <GithubIcon className="size-5" />
            Nguồn mở trên GitHub
          </a>
        </div>

        {/* Trust badges */}
        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-stone-500 dark:text-stone-400">
          <div className="flex items-center gap-2">
            <Shield className="size-4 text-emerald-600" />
            <span>Bảo mật tuyệt đối</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="size-4 text-blue-600" />
            <span>Tự lưu trữ 100%</span>
          </div>
          <div className="flex items-center gap-2">
            <GithubIcon className="size-4 text-stone-600 dark:text-stone-400" />
            <span>Mã nguồn mở</span>
          </div>
        </div>
      </div>
    </section>
  );
}
