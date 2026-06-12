# Phase 3: ThemeToggle UI Component

## Overview
**Priority:** P1
**Effort:** 1h
**Status:** Pending
**Blocked by:** Phase 2

Tạo ThemeToggle UI component với accessible button.

## Requirements

### Functional
- Button toggle giữa light/dark/system
- Icon thay đổi theo theme (sun/moon/monitor)
- Tooltip hiển thị theme hiện tại
- Keyboard accessible (Tab, Enter, Space)

### Non-functional
- Smooth transition khi toggle
- Responsive trên mobile
- Accessible (aria-label, role)

## Files to Create

**Note:** Test directory `components/__tests__/` should already exist from Phase 2.

### 1. `components/ThemeToggle.tsx`
**Action:** New  
**Mô tả:** Theme toggle button component

**Implementation:**

```typescript
'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const handleClick = () => {
    // Cycle: light → dark → system → light
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
    setTheme(next);
  };

  const getIcon = () => {
    if (theme === 'system') return <Monitor className="size-4" />;
    if (resolvedTheme === 'dark') return <Moon className="size-4" />;
    return <Sun className="size-4" />;
  };

  const getLabel = () => {
    if (theme === 'system') return 'Theme: System';
    if (resolvedTheme === 'dark') return 'Theme: Dark';
    return 'Theme: Light';
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 text-stone-600 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
      aria-label={getLabel()}
      title={getLabel()}
    >
      {getIcon()}
    </button>
  );
}
```

**Design decisions:**
- Cycle through 3 states (light → dark → system) thay vì dropdown
- Simpler UX, fewer clicks
- Icon + tooltip đủ để hiểu

## Files to Create (Tests)

### 2. `components/__tests__/ThemeToggle.test.tsx`
**Action:** New  
**Mô tả:** Unit tests cho ThemeToggle

**Test cases:**

```typescript
import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../ThemeToggle';
import { ThemeProvider } from '../ThemeProvider';

const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('renders with correct aria-label', () => {
    mockMatchMedia(false);
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    expect(screen.getByLabelText('Theme: Light')).toBeInTheDocument();
  });

  it('cycles through themes on click', () => {
    mockMatchMedia(false);
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    const button = screen.getByRole('button');
    
    // light → dark
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: Dark')).toBeInTheDocument();
    
    // dark → system
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: System')).toBeInTheDocument();
    
    // system → light
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: Light')).toBeInTheDocument();
  });

  it('keyboard accessible (Enter key)', () => {
    mockMatchMedia(false);
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    const button = screen.getByRole('button');
    
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(screen.getByLabelText('Theme: Dark')).toBeInTheDocument();
  });
});
```

## Success Criteria

- [ ] Button renders với correct icon
- [ ] Click cycles through light → dark → system
- [ ] Icon updates theo theme
- [ ] aria-label accessible
- [ ] Keyboard navigation hoạt động
- [ ] Tests pass

## Verification

### Manual Testing
1. Click toggle button — icon should change
2. Press Tab — focus should land on button
3. Press Enter — theme should toggle
4. Check aria-label trong DevTools

### Visual Testing
- Light mode: Sun icon ☀️
- Dark mode: Moon icon 🌙
- System mode: Monitor icon 🖥️

## Risks

### Risk: Icon not clear to users
**Mitigation:** Title tooltip provides text label

## Next Steps

→ Phase 4: Integration vào layout + header
