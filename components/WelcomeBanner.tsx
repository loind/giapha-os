"use client";

import { useUser } from "@/components/UserProvider";
import { CalendarDays, Users, GitBranch } from "lucide-react";

interface WelcomeBannerProps {
  totalMembers?: number;
  totalGenerations?: number;
  upcomingEventsCount?: number;
}

export default function WelcomeBanner({
  totalMembers,
  totalGenerations,
  upcomingEventsCount,
}: WelcomeBannerProps) {
  const { user, profile } = useUser();
  const displayName = user?.email?.split("@")[0] || "bạn";

  return (
    <div className="mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50 via-white to-stone-50 dark:from-amber-900/10 dark:via-stone-800 dark:to-stone-800 border border-amber-100 dark:border-amber-800/30 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 dark:text-stone-200">
            Xin chào, {displayName} 👋
          </h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm mt-1">
            Gia phả dòng họ Nguyễn Danh — Xuân Đỉnh
          </p>
        </div>

        {/* Mini stats */}
        {(totalMembers !== undefined || totalGenerations !== undefined || upcomingEventsCount !== undefined) && (
          <div className="flex items-center gap-4 sm:gap-6">
            {totalMembers !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="size-4 text-amber-600 dark:text-amber-400" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">{totalMembers}</span>
                <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">thành viên</span>
              </div>
            )}
            {totalGenerations !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <GitBranch className="size-4 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">{totalGenerations}</span>
                <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">thế hệ</span>
              </div>
            )}
            {upcomingEventsCount !== undefined && upcomingEventsCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span className="font-semibold text-stone-700 dark:text-stone-300">{upcomingEventsCount}</span>
                <span className="text-stone-500 dark:text-stone-400 hidden sm:inline">sự kiện</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
