"use client";

import config from "@/app/config";
import HeaderMenu from "@/components/HeaderMenu";
import {
  Home,
  Network,
  Calendar,
  BarChart2,
  Image as ImageIcon,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface DashboardHeaderProps {
  breadcrumbs?: BreadcrumbItem[];
  showNav?: boolean;
}

const mainNavItems = [
  { label: "Trang chủ", href: "/dashboard", icon: Home },
  { label: "Cây gia phả", href: "/dashboard/members", icon: Network },
  { label: "Sự kiện", href: "/dashboard/events", icon: Calendar },
  { label: "Thống kê", href: "/dashboard/stats", icon: BarChart2 },
  { label: "Phòng trưng bày", href: "/dashboard/gallery", icon: ImageIcon },
];

export default function DashboardHeader({
  breadcrumbs = [],
  showNav = true,
}: DashboardHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-border shadow-soft transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 sm:gap-3"
              >
                <div className="relative size-8 rounded-xl overflow-hidden shrink-0 border border-border transition-all">
                  <Image
                    src="/icon.png"
                    alt="Logo"
                    fill
                    className="object-contain"
                    sizes="32px"
                  />
                </div>
                <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-800 group-hover:text-amber-700 transition-colors hidden sm:block">
                  {config.siteName}
                </h1>
              </Link>

              {/* Desktop Navigation */}
              {showNav && (
                <nav className="hidden lg:flex items-center gap-1 ml-8">
                  {mainNavItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href || "#"}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600 hover:text-amber-700 hover:bg-amber-50/50 rounded-lg transition-colors"
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Right side: Mobile menu button + User menu */}
            <div className="flex items-center gap-2">
              {showNav && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="size-5" />
                  ) : (
                    <Menu className="size-5" />
                  )}
                </button>
              )}
              <HeaderMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {showNav && mobileMenuOpen && (
        <div className="lg:hidden bg-surface border-b border-border shadow-lg">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href || "#"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-stone-700 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                >
                  <Icon className="size-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <div className="bg-surface/50 border-b border-stone-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <nav className="flex items-center gap-2 text-sm">
              <Link
                href="/dashboard"
                className="text-stone-500 hover:text-amber-700 transition-colors"
              >
                <Home className="size-4" />
              </Link>
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="size-3.5 text-stone-300" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-stone-500 hover:text-amber-700 transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-stone-800 font-semibold">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
