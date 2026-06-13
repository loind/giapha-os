"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Network,
  LayoutDashboard,
  BarChart2,
  Users,
  CalendarDays,
  Image as ImageIcon,
  Shield,
  GitMerge,
} from "lucide-react";
import { useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const tabs = [
  { id: "tree", label: "Sơ đồ cây", icon: Network },
  { id: "dashboard", label: "Bảng điều khiển", icon: LayoutDashboard },
  { id: "stats", label: "Thống kê", icon: BarChart2 },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function LandingPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("tree");
  const reducedMotion = useReducedMotion();

  return (
    <section className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      {/* Tab switcher */}
      <div className="flex justify-center mb-6">
        <div className="inline-flex items-center gap-1 p-1.5 bg-white/60 dark:bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-200/50 dark:border-stone-700/50 shadow-sm">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 min-h-[44px] ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm"
                    : "text-stone-500 hover:text-stone-700 hover:bg-white/50"
                }`}
              >
                <Icon className="size-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Browser frame mockup */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-stone-900/10 border border-stone-200/50 dark:border-stone-700/50 bg-white dark:bg-stone-900">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-4 py-3 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700">
          <div className="flex gap-1.5">
            <div className="size-3 rounded-full bg-red-400/80" />
            <div className="size-3 rounded-full bg-yellow-400/80" />
            <div className="size-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 bg-white dark:bg-stone-700 rounded-lg text-xs text-stone-400 border border-stone-200 dark:border-stone-600 max-w-xs truncate">
              nguyendanh-giapha.vercel.app/dashboard
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="relative h-[360px] sm:h-[400px] md:h-[450px] bg-stone-50 dark:bg-stone-900 overflow-hidden">
          <AnimatePresence mode="wait">
            {!reducedMotion && (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0"
              >
                <PreviewContent tab={activeTab} />
              </motion.div>
            )}
            {reducedMotion && <PreviewContent tab={activeTab} />}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating annotation labels */}
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        {[
          { icon: Shield, text: "Bảo mật phân quyền" },
          { icon: Users, text: "Quản lý thành viên" },
          { icon: GitMerge, text: "Tra cứu danh xưng" },
          { icon: CalendarDays, text: "Sự kiện & Lịch" },
          { icon: ImageIcon, text: "Phòng trưng bày" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.text}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-600 dark:text-stone-400 bg-white/60 dark:bg-stone-800/60 backdrop-blur-sm rounded-full border border-stone-200/50 dark:border-stone-700/50"
            >
              <Icon className="size-3.5 text-amber-600 dark:text-amber-400" />
              {item.text}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PreviewContent({ tab }: { tab: TabId }) {
  switch (tab) {
    case "tree":
      return <TreePreview />;
    case "dashboard":
      return <DashboardPreview />;
    case "stats":
      return <StatsPreview />;
  }
}

function TreePreview() {
  return (
    <div className="p-6 sm:p-8 flex flex-col items-center justify-center h-full bg-gradient-to-b from-amber-50/30 to-stone-50 dark:from-amber-900/10 dark:to-stone-900">
      {/* Mock family tree SVG */}
      <svg
        viewBox="0 0 400 250"
        className="w-full max-w-md h-auto"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Connection lines */}
        <line x1="200" y1="50" x2="200" y2="80" stroke="#d4a574" strokeWidth="2" />
        <line x1="200" y1="80" x2="120" y2="80" stroke="#d4a574" strokeWidth="2" />
        <line x1="200" y1="80" x2="280" y2="80" stroke="#d4a574" strokeWidth="2" />
        <line x1="120" y1="80" x2="120" y2="110" stroke="#d4a574" strokeWidth="2" />
        <line x1="280" y1="80" x2="280" y2="110" stroke="#d4a574" strokeWidth="2" />
        <line x1="120" y1="145" x2="120" y2="175" stroke="#d4a574" strokeWidth="2" />
        <line x1="280" y1="145" x2="280" y2="175" stroke="#d4a574" strokeWidth="2" />
        <line x1="120" y1="175" x2="80" y2="175" stroke="#d4a574" strokeWidth="2" />
        <line x1="120" y1="175" x2="160" y2="175" stroke="#d4a574" strokeWidth="2" />

        {/* Root node */}
        <rect x="170" y="15" width="60" height="35" rx="8" fill="#fef3c7" stroke="#d97706" strokeWidth="1.5" />
        <text x="200" y="37" textAnchor="middle" className="text-[10px] fill-stone-700 font-medium">Đời 1</text>

        {/* Generation 2 */}
        <rect x="90" y="110" width="60" height="35" rx="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.5" />
        <text x="120" y="132" textAnchor="middle" className="text-[10px] fill-stone-700 font-medium">Đời 2</text>
        <rect x="250" y="110" width="60" height="35" rx="8" fill="#fff7ed" stroke="#ea580c" strokeWidth="1.5" />
        <text x="280" y="132" textAnchor="middle" className="text-[10px] fill-stone-700 font-medium">Đời 2</text>

        {/* Generation 3 */}
        <rect x="50" y="200" width="60" height="35" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
        <text x="80" y="222" textAnchor="middle" className="text-[10px] fill-stone-700 font-medium">Đời 3</text>
        <rect x="130" y="200" width="60" height="35" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
        <text x="160" y="222" textAnchor="middle" className="text-[10px] fill-stone-700 font-medium">Đời 3</text>
        <rect x="250" y="200" width="60" height="35" rx="8" fill="#f0fdf4" stroke="#16a34a" strokeWidth="1.5" />
        <text x="280" y="222" textAnchor="middle" className="text-[10px] fill-stone-700 font-medium">Đời 3</text>
      </svg>
      <p className="text-sm text-stone-500 dark:text-stone-400 mt-4 font-medium">
        Sơ đồ phả hệ trực quan với 3 chế độ xem
      </p>
    </div>
  );
}

function DashboardPreview() {
  return (
    <div className="p-4 sm:p-6 h-full bg-stone-50 dark:bg-stone-900 overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 h-full">
        {[
          { icon: Network, label: "Cây gia phả", color: "bg-amber-50 dark:bg-amber-900/20 text-amber-600" },
          { icon: GitMerge, label: "Danh xưng", color: "bg-blue-50 dark:bg-blue-900/20 text-blue-600" },
          { icon: BarChart2, label: "Thống kê", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
          { icon: ImageIcon, label: "Trưng bày", color: "bg-pink-50 dark:bg-pink-900/20 text-pink-600" },
          { icon: CalendarDays, label: "Sự kiện", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
          { icon: Users, label: "Thành viên", color: "bg-rose-50 dark:bg-rose-900/20 text-rose-600" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm"
            >
              <div className={`size-10 rounded-lg ${item.color} flex items-center justify-center`}>
                <Icon className="size-5" />
              </div>
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400 text-center">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsPreview() {
  return (
    <div className="p-6 sm:p-8 h-full bg-stone-50 dark:bg-stone-900 flex flex-col gap-4">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Thành viên", value: "47", color: "text-amber-600" },
          { label: "Thế hệ", value: "5", color: "text-blue-600" },
          { label: "Sự kiện", value: "12", color: "text-emerald-600" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="text-center p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm"
          >
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      {/* Mock chart */}
      <div className="flex-1 p-4 rounded-xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm flex items-end gap-2 justify-center">
        {[40, 65, 45, 80, 55, 70, 90, 60, 75, 85, 50, 95].map((h, i) => (
          <div
            key={i}
            className="w-4 sm:w-6 rounded-t-sm bg-gradient-to-t from-amber-400 to-amber-200 dark:from-amber-600 dark:to-amber-400 transition-all"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="text-sm text-stone-500 dark:text-stone-400 text-center font-medium">
        Thống kê và biểu đồ phân tích dòng họ
      </p>
    </div>
  );
}
