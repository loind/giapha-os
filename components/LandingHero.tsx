"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

interface LandingHeroProps {
  siteName: string;
}

export default function LandingHero({ siteName }: LandingHeroProps) {
  const reducedMotion = useReducedMotion();

  const motionProps = reducedMotion
    ? { initial: false, animate: { opacity: 1, y: 0 } }
    : {};

  return (
    <motion.div
      className="max-w-5xl text-center space-y-10 w-full relative z-10"
      {...(reducedMotion ? {} : { initial: "hidden", animate: "visible", variants: staggerContainer })}
      {...motionProps}
    >
      <motion.div
        className="space-y-6 sm:space-y-8 flex flex-col items-center"
        variants={fadeIn}
      >
        <motion.div
          whileHover={reducedMotion ? undefined : { scale: 1.05 }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-amber-800 bg-white/60 rounded-full shadow-[0_2px_10px_-3px_rgba(0,0,0,0.1)] border border-amber-200/50 relative overflow-hidden group"
        >
          <Sparkles className="size-4 text-amber-500" />
          Nền tảng gia phả hiện đại & bảo mật
          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
        </motion.div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight leading-[1.1] max-w-4xl">
          <span className="block">{siteName}</span>
        </h1>

        <p className="text-lg sm:text-xl md:text-2xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-light">
          Nơi ký ức dòng họ được lưu giữ mãi mãi. Gìn giữ và lưu truyền những
          giá trị, cội nguồn và truyền thống tốt đẹp cho các thế hệ mai sau.
        </p>
      </motion.div>

      <motion.div
        className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center w-full px-4 sm:px-0 relative"
        variants={fadeIn}
      >
        {/* Subtle glow behind the button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-amber-500/30 blur-2xl rounded-full z-0 hidden sm:block"></div>

        <Link
          href="/login"
          className="group inline-flex items-center justify-center gap-2 px-8 py-4 sm:px-10 sm:py-5 text-base sm:text-lg font-bold text-white bg-amber-600 hover:bg-amber-700 border border-amber-700 rounded-xl shadow-xl shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 transition-all duration-300 hover:-translate-y-1 active:translate-y-0 active:scale-[0.98] w-full sm:w-auto overflow-hidden relative min-h-[56px]"
        >
          <span className="relative z-10 flex items-center gap-3">
            Đăng nhập để xem thông tin
            <ArrowRight className="size-5 group-hover:translate-x-1.5 transition-transform" />
          </span>
        </Link>

        <a
          href="#features"
          className="group inline-flex items-center justify-center gap-2 px-6 py-4 text-base font-semibold text-stone-600 hover:text-stone-800 bg-white/50 hover:bg-white/80 border border-stone-200/50 hover:border-stone-300 rounded-xl transition-all duration-300 w-full sm:w-auto min-h-[56px] backdrop-blur-sm"
        >
          <span className="flex items-center gap-2">
            Tìm hiểu thêm
            <ChevronDown className="size-4 group-hover:translate-y-0.5 transition-transform" />
          </span>
        </a>
      </motion.div>
    </motion.div>
  );
}
