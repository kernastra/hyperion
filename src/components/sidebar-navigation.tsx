"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Downloads", href: "/", icon: "⬇️" },
  { label: "Queue", href: "/queue", icon: "📋" },
  { label: "History", href: "/history", icon: "📜" },
  { label: "Settings", href: "/settings", icon: "⚙️" },
];

export function SidebarNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button 
          onClick={toggleMobileMenu}
          className="bg-nav-bg dark:bg-gray-800 text-white p-2 rounded-lg shadow-lg"
        >
          ☰
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:sticky lg:top-2 left-0 w-80 lg:w-[280px] xl:w-[300px] 
          h-full lg:h-[calc(100vh-1rem)] bg-nav-bg dark:bg-gray-800 text-white lg:rounded-xl p-4 
          z-50 transform transition-transform duration-300 ease-in-out 
          lg:flex-shrink-0 overflow-y-auto
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style jsx>{`
          aside::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {/* Close button for mobile */}
        <button 
          onClick={closeMobileMenu}
          className="lg:hidden absolute top-3 right-3 text-white text-xl"
        >
          ✕
        </button>
        
        {/* Logo */}
        <div className="mb-28 pt-6 lg:pt-0">
          <div className="text-center">
            <div className="h-24 w-24 mx-auto mb-2 bg-accent-blue rounded-lg flex items-center justify-center">
              <span className="text-2xl font-bold text-white">H</span>
            </div>
            <div className="text-xl font-bold text-white mb-1">Hyperion</div>
            <div className="text-base text-gray-400">Video Downloader</div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2 text-base">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative
                  ${isActive 
                    ? 'text-white font-semibold before:absolute before:-left-4 before:inset-y-0 before:w-1 before:bg-accent-blue before:rounded-r' 
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                  isActive ? 'bg-accent-blue' : 'bg-gray-400'
                }`}>
                  {item.icon}
                </div>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="mt-auto pt-4 border-t border-gray-600 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <ThemeToggle />
          </div>
        </div>
        
        {/* Version Number at bottom */}
        <div className="absolute bottom-4 left-4 right-4 text-center">
          <div className="text-xs text-gray-500">Hyperion v1.0.0</div>
        </div>
      </aside>
    </>
  );
}
