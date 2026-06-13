"use client";

import { motion, Variants } from "framer-motion";
import {
  Users,
  Network,
  ShieldCheck,
  CalendarDays,
  GitMerge,
  Database,
} from "lucide-react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const features = [
  {
    icon: Users,
    title: "Quản lý Thành viên",
    desc: "Cập nhật thông tin chi tiết, tiểu sử và hình ảnh của từng thành viên trong dòng họ một cách nhanh chóng và bảo mật.",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Network,
    title: "Sơ đồ Sáng tạo",
    desc: "Xem trực quan sơ đồ phả hệ với 3 chế độ: cây truyền thống, sơ đồ tư duy, và bản đồ bong bóng. Dễ dàng thao tác và tùy chỉnh.",
    color: "text-blue-700 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: ShieldCheck,
    title: "Bảo mật Tối đa",
    desc: "Dữ liệu riêng tư như số điện thoại, quê quán được phân quyền chặt chẽ, bảo vệ an toàn trên hệ thống đám mây.",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
  },
  {
    icon: CalendarDays,
    title: "Sự kiện & Lịch",
    desc: "Theo dõi ngày giỗ, sinh nhật, và các sự kiện quan trọng của dòng họ. Tích hợp lịch âm lịch Việt Nam chính xác.",
    color: "text-purple-700 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: GitMerge,
    title: "Tra cứu Danh xưng",
    desc: "Hệ thống gọi tên họ hàng chuẩn xác theo quan hệ gia đình Việt Nam. Dễ dàng tra cứu danh xưng cho mọi mối quan hệ.",
    color: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-900/20",
  },
  {
    icon: Database,
    title: "Xuất & Import dữ liệu",
    desc: "Hỗ trợ xuất PDF, ảnh, CSV, GEDCOM. Import dữ liệu từ file CSV hoặc GEDCOM. Sao lưu và phục hồi toàn bộ hệ thống.",
    color: "text-teal-700 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-900/20",
  },
];

export default function LandingFeatures() {
  const reducedMotion = useReducedMotion();

  return (
    <section id="features" className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Section header */}
      <div className="text-center mb-12 sm:mb-16">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 dark:text-stone-100 tracking-tight">
          Tính năng nổi bật
        </h2>
        <p className="mt-4 text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto">
          Đầy đủ công cụ để quản lý, lưu giữ và truyền lại gia phả dòng họ cho
          thế hệ mai sau.
        </p>
      </div>

      {/* Feature grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        role="list"
        {...(reducedMotion
          ? {}
          : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-100px" }, variants: staggerContainer })}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              variants={fadeIn}
              className="card-feature flex flex-col items-start group relative overflow-hidden"
              role="listitem"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-linear-to-br from-amber-100/50 to-transparent rounded-bl-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              <div
                className={`p-3.5 rounded-2xl mb-6 shadow-sm ring-1 ring-stone-100 dark:ring-stone-700 group-hover:scale-110 group-hover:shadow-md transition-all duration-300 relative z-10 ${feature.bg}`}
              >
                <Icon className={`size-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-stone-800 dark:text-stone-200 mb-3 font-serif relative z-10 group-hover:text-amber-900 dark:group-hover:text-amber-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed relative z-10">
                {feature.desc}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
