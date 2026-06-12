# Phase 4: Integration vào Layout + Header

## Overview
**Priority:** P0
**Effort:** 30min
**Status:** Pending
**Blocked by:** Phase 2, Phase 3

Integrate ThemeProvider vào root layout và ThemeToggle vào header.

## Requirements

### Functional
- ThemeProvider wraps toàn bộ app
- ThemeToggle visible trong header (desktop + mobile)
- Theme persists across page navigation

## Files to Modify

### 1. `app/layout.tsx`
**Action:** Edit  
**Mô tả:** Wrap app với ThemeProvider

**Changes:**

```diff
  import type { Metadata } from "next";
  import { Inter, Playfair_Display } from "next/font/google";
  import config from "./config";
  import "./globals.css";
+ import { ThemeProvider } from "@/components/ThemeProvider";

  // ... font setup ...

  export default function RootLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
      <html lang="vi">
        <body
          className={`${inter.variable} ${playfair.variable} font-sans antialiased relative`}
        >
+         <ThemeProvider>
            {children}
+         </ThemeProvider>
        </body>
      </html>
    );
  }
```

### 2. `components/DashboardHeader.tsx`
**Action:** Edit  
**Mô tả:** Thêm ThemeToggle vào header (desktop + mobile)

**Changes:**

```diff
  import config from "@/app/config";
  import HeaderMenu from "@/components/HeaderMenu";
+ import ThemeToggle from "@/components/ThemeToggle";
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
  // ...

  // Desktop header — right side
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
+   <ThemeToggle />
    <HeaderMenu />
  </div>

  // Mobile menu — thêm ThemeToggle vào đầu menu
  <div className="lg:hidden bg-surface border-b border-border shadow-lg">
    <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
+     <div className="flex items-center justify-between pb-3 mb-3 border-b border-stone-100">
+       <span className="text-sm font-medium text-stone-700">Theme</span>
+       <ThemeToggle />
+     </div>
      {mainNavItems.map((item) => {
        // ... existing nav items ...
      })}
    </nav>
  </div>
```

## Success Criteria

- [ ] ThemeProvider wraps app (no errors)
- [ ] ThemeToggle visible trong desktop header
- [ ] ThemeToggle visible trong mobile menu
- [ ] Theme persists khi navigate giữa pages
- [ ] No layout shift khi toggle

## Verification

### Manual Testing
1. Navigate đến `/dashboard` — toggle button visible
2. Click toggle — theme switches
3. Navigate đến `/dashboard/members` — theme persists
4. Open mobile menu — toggle visible
5. Resize window — toggle responsive

### Visual Inspection
- Desktop: Toggle button giữa mobile menu button và HeaderMenu
- Mobile: Toggle ở đầu menu với label "Theme"

## Risks

### Risk: Layout shift khi ThemeProvider loads
**Mitigation:** Use `suppressHydrationWarning` trên `<html>` nếu cần

### Risk: Toggle not accessible trên mobile
**Mitigation:** Place toggle ở đầu mobile menu, dễ thấy

## Next Steps

→ Phase 5: Testing & validation
