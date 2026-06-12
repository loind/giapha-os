# Phase 2: ThemeProvider Component

## Overview
**Priority:** P0
**Effort:** 2h
**Status:** Pending
**Blocked by:** Phase 1

Tạo ThemeProvider component với system preference detection + localStorage override.

## Requirements

### Functional
- Detect system preference (`prefers-color-scheme`)
- Read localStorage override
- Apply `.dark` class to `<html>` element
- Provide `toggleTheme()` function via context
- Prevent flash of incorrect theme (FOIT)

### Non-functional
- Zero layout shift
- < 100ms theme switch
- Graceful degradation nếu localStorage unavailable

## Architecture

```
ThemeProvider (React Context)
├── State: theme ('light' | 'dark' | 'system')
├── State: resolvedTheme ('light' | 'dark')
├── useEffect: detect system preference
├── useEffect: read localStorage
├── useEffect: apply .dark class to <html>
└── Context value: { theme, resolvedTheme, setTheme, toggleTheme }
```

## Files to Create

### 0. Create test directory
**Action:** Create directory  
**Command:** `mkdir -p components/__tests__`

### 1. `components/ThemeProvider.tsx`
**Action:** New  
**Mô tả:** Theme context provider

**Implementation:**

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_KEY = 'giapha-theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');

  // Initialize from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setThemeState(stored);
    }
  }, []);

  // Detect system preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateTheme = () => {
      const effectiveTheme = theme === 'system' 
        ? (mediaQuery.matches ? 'dark' : 'light')
        : theme;
      
      setResolvedTheme(effectiveTheme);
      
      // Apply .dark class to <html>
      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    updateTheme();
    
    // Listen for system preference changes
    if (theme === 'system') {
      mediaQuery.addEventListener('change', updateTheme);
      return () => mediaQuery.removeEventListener('change', updateTheme);
    }
  }, [theme]);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference:', e);
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const current = prev === 'system' 
        ? (resolvedTheme === 'dark' ? 'light' : 'dark')
        : (prev === 'dark' ? 'light' : 'dark');
      return current;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## Files to Create (Tests)

### 2. `components/__tests__/ThemeProvider.test.tsx`
**Action:** New  
**Mô tả:** Unit tests cho ThemeProvider

**Test cases:**

```typescript
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeProvider';

// Mock matchMedia
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

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('applies dark class when system preference is dark', () => {
    mockMatchMedia(true);
    render(<ThemeProvider><div>Test</div></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('does not apply dark class when system preference is light', () => {
    mockMatchMedia(false);
    render(<ThemeProvider><div>Test</div></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('reads theme from localStorage', () => {
    localStorage.setItem('giapha-theme', 'dark');
    mockMatchMedia(false);
    render(<ThemeProvider><div>Test</div></ThemeProvider>);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggleTheme switches between light and dark', () => {
    mockMatchMedia(false);
    function TestComponent() {
      const { toggleTheme, resolvedTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{resolvedTheme}</span>
          <button onClick={toggleTheme}>Toggle</button>
        </div>
      );
    }
    render(<ThemeProvider><TestComponent /></ThemeProvider>);
    expect(screen.getByTestId('theme').textContent).toBe('light');
    act(() => screen.getByText('Toggle').click());
    expect(screen.getByTestId('theme').textContent).toBe('dark');
  });
});
```

## Success Criteria

- [ ] ThemeProvider wraps app without errors
- [ ] System preference detected correctly
- [ ] localStorage read/write hoạt động
- [ ] `.dark` class applied/removed đúng cách
- [ ] `useTheme()` hook accessible trong components
- [ ] Tests pass (Vitest)

## Verification

### Unit Tests
```bash
npx vitest run components/__tests__/ThemeProvider.test.tsx
```

### Manual Testing
1. Open DevTools → Application → Local Storage
2. Set `giapha-theme` = 'dark'
3. Reload page — dark mode should activate
4. Clear localStorage — should fallback to system preference

## Risks

### Risk: localStorage unavailable (private browsing)
**Mitigation:** Wrap localStorage calls trong try-catch. Fallback to system preference only.

### Risk: Hydration mismatch (SSR)
**Mitigation:** Use `useEffect` to apply theme client-side only. Server renders light mode by default.

## Next Steps

→ Phase 3: ThemeToggle UI component
