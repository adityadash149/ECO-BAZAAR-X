import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = () => {
  // Initialize strictly from saved preference (default light)
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;

    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="relative w-14 h-8 flex items-center bg-gray-200 dark:bg-emerald-900/40 rounded-full p-1 transition-all duration-300 border border-emerald-100 dark:border-emerald-800 shadow-inner"
      aria-label="Toggle Dark Mode"
    >
      <div
        className={`absolute w-6 h-6 bg-white dark:bg-emerald-500 rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${
          isDark ? 'translate-x-6' : 'translate-x-0'
        }`}
      >
        {isDark ? <Moon size={14} className="text-[#041d16]" /> : <Sun size={14} className="text-amber-500" />}
      </div>
    </button>
  );
};

export default ThemeToggle;
