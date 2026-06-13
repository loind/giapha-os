"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import config from "@/app/config";
import ThemeToggle from "./ThemeToggle";

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 20);

      // Calculate scroll progress
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (y / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 transition-all duration-300 ${
        scrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      {/* Scroll progress bar */}
      {scrolled && (
        <div className="absolute bottom-0 left-0 h-[2px] bg-amber-500 transition-all duration-100" style={{ width: `${scrollProgress}%` }} />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="group flex items-center gap-2 sm:gap-3">
            <div className="relative size-8 rounded-xl overflow-hidden shrink-0 border border-border transition-all group-hover:scale-105">
              <Image
                src="/icon.png"
                alt="Logo"
                fill
                className="object-contain"
                sizes="32px"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-700 transition-colors hidden sm:block">
              {config.siteName}
            </h1>
          </Link>

          {/* Right side nav */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/about"
              className="px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-lg transition-colors min-h-[44px] flex items-center"
            >
              Giới thiệu
            </Link>
            <ThemeToggle />
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 min-h-[44px] active:scale-[0.98]"
            >
              Đăng nhập
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
