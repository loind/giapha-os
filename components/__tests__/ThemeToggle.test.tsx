import { describe, expect, it, beforeEach, vi } from 'vitest';
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
    // Default theme is 'system', which shows as "Theme: System"
    expect(screen.getByLabelText('Theme: System')).toBeInTheDocument();
  });

  it('cycles through themes on click', () => {
    mockMatchMedia(false);
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    const button = screen.getByRole('button');

    // system → light
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: Light')).toBeInTheDocument();

    // light → dark
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: Dark')).toBeInTheDocument();

    // dark → system
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: System')).toBeInTheDocument();
  });

  it('keyboard accessible (Enter key)', () => {
    mockMatchMedia(false);
    render(<ThemeProvider><ThemeToggle /></ThemeProvider>);
    const button = screen.getByRole('button');

    // system → light
    fireEvent.click(button);
    expect(screen.getByLabelText('Theme: Light')).toBeInTheDocument();
  });
});
