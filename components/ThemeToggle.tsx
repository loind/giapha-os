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
