---
version: alpha
name: GiaPha-OS
description: A modern, elegant, and secure open-source family tree platform designed for Vietnamese families to preserve their lineage and heritage.
colors:
  primary: "#1c1917"
  secondary: "#57534e"
  tertiary: "#d97706"
  neutral: "#fafaf9"
  surface: "#ffffff"
  border: "#e7e5e4"
  error: "#dc2626"
typography:
  headline-display:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 30px
    fontWeight: 700
    lineHeight: 1.2
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.4
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1
rounded:
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  "3xl": 24px
  full: 9999px
spacing:
  base: 16px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  "2xl": 48px
  "3xl": 64px
  gutter: 24px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "#292524"
  button-amber:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: 10px
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    rounded: "{rounded.xl}"
    padding: 16px
  button-outline-hover:
    backgroundColor: "{colors.neutral}"
  divider:
    backgroundColor: "{colors.border}"
    height: 1px
  badge-error:
    backgroundColor: "{colors.error}"
    textColor: "{colors.surface}"
    rounded: "{rounded.sm}"
    padding: 4px 8px
  card-feature:
    backgroundColor: "rgba(255, 255, 255, 0.7)"
    rounded: "{rounded.3xl}"
    padding: 32px
navigation:
  header-height: 64px
  mobile-breakpoint: 1024px
  breadcrumb-height: 40px
  toolbar-height: 48px
  touch-target-min: 44px
---

# GiaPha-OS Design System

## Overview

**GiaPha-OS** is a modern, elegant, and secure open-source family tree platform designed for Vietnamese families to preserve, trace, and pass down their lineage, history, and cultural traditions. The design balances professional modern aesthetics with visual indicators of respect and tradition.

The interface evokes an organic, trustworthy feel through warm limestone backgrounds and crisp typography. Visual details balance technical precision (for timestamps, relations, and lineages) with high-fidelity editorial layouts (for family homepages and history scrolls).

---

## Colors

The palette is rooted in soft, warm neutrals, high-contrast primary dark slate, and an evocative golden-amber accent representing lineage, tradition, and harvest.

- **Primary (#1C1917):** A deep charcoal (Stone-900) used for headlines, core branding, and important interactive actions to guarantee maximum readability and weight.
- **Secondary (#57534E):** A sophisticated granite grey (Stone-600) used for metadata, inactive states, icons, and supporting structural layouts.
- **Tertiary (#D97706):** A golden warm amber (Amber-600) representing heritage, warmth, and lineage. Used exclusively as an accent for focus outlines, primary badges, and key interactive highlights.
- **Neutral (#FAFAF9):** A soft warm limestone (Stone-50) serving as the main canvas backdrop, providing a softer and more organic feel than sterile hospital white.
- **Surface (#FFFFFF):** Pure white used for elevated content layers such as member cards, detail dialogs, and navigation headers.
- **Border (#E7E5E4):** Stone-200 used for subtle grid lines and component borders.

---

## Typography

The type system pairs the elegance of **Playfair Display** (for traditional editorial headings and branding) with the readability of **Inter** (for UI elements, dense data displays, and complex family tree structures).

- **Branding & Headings:** Set in *Playfair Display* with robust weights to create a sense of heritage, lineage, and permanence.
- **Body & Controls:** Set in *Inter* to ensure crisp legibility at small sizes, particularly within name nodes on the family chart.
- **Data & Relationships:** Capitalized *Inter* is used for relational tags (e.g., "CHỒNG", "VỢ") with slight letter-spacing for premium technical clarity.

---

## Layout

The page architecture follows a fluid model with special focus on horizontal scrolling capabilities for large phả hệ structures.

- **Fluid Grid:** Mobile-first container padding scaling up dynamically for large desktop display setups (max width 1280px).
- **Tree Spacing:** The phả hệ visualization uses standardized layout spacing to organize nodes and relationship lines without overlapping.
- **Containment:** Components are grouped logically inside elevated background cards with generous inner padding (`spacing.lg` to `spacing.xl`) and high backdrop-blur values (`backdrop-blur-xl`).

---

## Elevation & Depth

Visual layers are structured logically using physical and color tonal hierarchies.

- **Tonal Layers:** Rather than deep dark box shadows, depth is achieved by stacking absolute white (`#FFFFFF`) surfaces on top of the limestone neutral background (`#FAFAF9`), often styled with `bg-white/70 backdrop-blur-xl`.
- **Soft Shadows:** Interactive cards utilize micro-shadows (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`) that scale dynamically to a higher elevation (`shadow-[0_20px_40px_rgb(0,0,0,0.08)]`) with smooth translate transforms (`-translate-y-1`) on hover.
- **Rings:** Key focused states use `ring-2 ring-white` or `ring-stone-100` to establish clean separation between parent containers.

---

## Shapes

Soft, consistent curves bring warmth and modern approachability to the digital archive.

- **Architectural Curves:** Interactive buttons, input fields, and member card containers use curved aesthetics (`rounded-2xl` and `rounded-3xl`) to establish an elegant, organic feel.
- **Rounded Avatars:** Circular elements (`rounded-full`) are reserved for profile pictures, gender indicators, and secondary navigation buttons.

---

## Components

Style patterns for primary component atoms:

- **Buttons:**
  - *Primary Button:* Styled in deep stone (`#1C1917`) with rounded-2xl curves, high-contrast white text, and hover translation effects.
  - *Action Badge Button:* Styled in amber (`#D97706`) with rounded-full curves for focal actions (e.g., adding members, sharing tree).
  - *Outline Button:* Transparent background, thin borders (`border-stone-200`), stone-600 text, and a transition to limestone background on hover.
- **FamilyNodeCard:**
  - Standard card structure with size scaling (`w-20` on mobile up to `w-28` on desktop).
  - Semi-transparent white background with active blur and a smooth 1px white border.
  - Profile pictures with rounded-full outlines, utilizing distinct color backgrounds based on genders (male/female visual cues).
- **Dialogs & Modals:**
  - Framed in full screen masks on mobile, scaling to centered `rounded-3xl` drawers on desktop.
  - Clean divider lines and ample internal padding.

---

## Do's and Don'ts

- **Do** pair Playfair Display for branding/headlines with Inter for data to maintain clear heritage styling.
- **Don't** use sterile pure black backgrounds or pure gray shadows; always keep shadow values extremely soft and transparent.
- **Do** verify contrast ratios between the golden amber actions and their backgrounds.
- **Don't** mix square/sharp corners with organic card shapes. All main content cards should utilize uniform `rounded-3xl` styles.

---

## Navigation Patterns

### Top Navigation Bar
- Fixed header at top with `sticky` positioning
- Height: 64px on desktop, responsive to mobile
- Contains: Logo, main navigation links, user menu
- Background: `bg-surface/80` with `backdrop-blur-xl`
- Border: `border-b border-border` with `shadow-soft`

### Main Navigation Items
- Trang chủ (Home)
- Cây gia phả (Family Tree)
- Sự kiện (Events)
- Thống kê (Statistics)
- Phòng trưng bày (Gallery)

### Breadcrumbs
- Located below the main header
- Shows current location in the app hierarchy
- Home icon links to dashboard
- Chevron separators between items
- Current page shown without link, bold text

### Mobile Navigation
- Hamburger menu button appears on screens < 1024px
- Menu slides down when activated
- Full-height overlay with navigation links
- Close button (X) to dismiss

### Touch Targets
- Minimum size: 44px × 44px for all interactive elements
- Expand/collapse buttons on family tree: 32px minimum
- This ensures good usability on mobile devices

---

## Form Patterns

### Date Input Groups
- Use `/` separators between day/month/year inputs
- Center-aligned text within inputs
- Compact sizing: `w-14` to `w-20` per field
- Placeholder text: short abbreviations (Ng, Th, Nm)

### Section Headers
- Icon in a colored badge (e.g., `bg-amber-50`)
- Section title in serif font
- Optional subtitle with required field indicator
- Bottom border to separate from content

### Required Fields
- Marked with red asterisk `*`
- Located immediately after field label

### Active Filter Indicators
- Chips/tags showing active filters
- Color-coded: amber for search, blue for filter options
- X button to clear individual filters
- "Xóa tất cả" link to clear all filters

---

## Component States

### Buttons
- **Default:** Solid background, visible border
- **Hover:** Slight scale down, shadow increase, color shift
- **Active/Pressed:** Scale to 95%, darker background
- **Disabled:** Reduced opacity, no cursor changes

### Input Fields
- **Default:** Light background, subtle border
- **Focus:** Amber border, ring effect, slightly lighter background
- **Error:** Red border, error message below
- **Disabled:** Grayed out, no interaction

### Cards
- Semi-transparent white background
- Rounded corners (`rounded-2xl` to `rounded-3xl`)
- Soft shadow that increases on hover
- Subtle border that darkens on hover

### Tree Node Expand/Collapse
- Circular button below parent node
- `+` icon when collapsed, `-` icon when expanded
- Larger touch target (32px minimum)
- Hover state with amber color change
