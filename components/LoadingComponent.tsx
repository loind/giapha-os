import { Loader2 } from "lucide-react";

interface LoadingComponentProps {
  variant?: "spinner" | "skeleton";
  message?: string;
}

export default function LoadingComponent({
  variant = "spinner",
  message = "Đang tải dữ liệu gia phả...",
}: LoadingComponentProps) {
  if (variant === "skeleton") {
    return (
      <main className="max-w-5xl mx-auto flex-1 overflow-auto bg-stone-50/50 flex flex-col p-4 sm:p-8">
        <div className="space-y-6 w-full">
          {/* Welcome banner skeleton */}
          <div className="h-24 bg-stone-200/50 dark:bg-stone-700/50 rounded-2xl animate-pulse" />
          {/* Events card skeleton */}
          <div className="h-48 bg-stone-200/50 dark:bg-stone-700/50 rounded-3xl animate-pulse" />
          {/* Feature grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-40 bg-stone-200/50 dark:bg-stone-700/50 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto flex-1 overflow-auto bg-stone-50/50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="absolute inset-0 bg-amber-200/50 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-white dark:bg-stone-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-stone-700">
            <Loader2 className="size-8 text-amber-600 animate-spin" />
          </div>
        </div>
        <p className="text-stone-500 dark:text-stone-400 font-medium animate-pulse">
          {message}
        </p>
      </div>
    </main>
  );
}

/** Skeleton row for list views */
export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-stone-100/50 dark:bg-stone-800/50 animate-pulse">
      <div className="size-12 bg-stone-200 dark:bg-stone-700 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4" />
        <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2" />
      </div>
    </div>
  );
}

/** Skeleton card for grid views */
export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl bg-stone-100/50 dark:bg-stone-800/50 animate-pulse">
      <div className="size-14 bg-stone-200 dark:bg-stone-700 rounded-xl mb-4" />
      <div className="h-5 bg-stone-200 dark:bg-stone-700 rounded w-2/3 mb-2" />
      <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-full" />
    </div>
  );
}
