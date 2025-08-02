"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same structure but no dynamic content
    return (
      <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-700 transition-colors w-full">
        <div className="w-5 h-5 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center relative">
          <Sun className="h-3 w-3 absolute" />
        </div>
        <span className="text-sm">Theme</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 dark:hover:bg-gray-700 transition-colors w-full"
    >
      <div className="w-5 h-5 bg-gray-400 dark:bg-gray-600 rounded flex items-center justify-center relative">
        <Sun className="h-3 w-3 absolute rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="h-3 w-3 absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      </div>
      <span className="text-sm">
        {theme === "dark" ? "Dark Mode" : "Light Mode"}
      </span>
    </button>
  );
}
