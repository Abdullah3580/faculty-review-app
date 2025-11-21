// src/components/ThemeSwitcher.tsx
"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="fixed bottom-5 right-5 z-50 p-3 rounded-full shadow-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xl transition-transform hover:scale-110"
      title="Toggle Theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}