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
