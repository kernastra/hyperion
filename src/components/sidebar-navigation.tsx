"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { useDownloadContext } from "@/contexts/DownloadContext";

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
  const pathname = usePathname();
  const { activeDownloads } = useDownloadContext();

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-nav-bg border-t border-white/10 flex items-stretch">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] transition-colors ${
                isActive ? 'text-accent-blue' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
              {item.label === 'Queue' && activeDownloads.length > 0 && (
                <span className="absolute top-1 right-[calc(50%-18px)] w-4 h-4 bg-badge-red text-[9px] font-bold flex items-center justify-center rounded-full text-white">
                  {activeDownloads.length > 9 ? '9+' : activeDownloads.length}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className="hidden lg:flex lg:flex-col lg:sticky lg:top-2 lg:w-[260px] xl:w-[280px] lg:h-[calc(100vh-1rem)] bg-nav-bg text-white lg:rounded-xl p-4 lg:flex-shrink-0 overflow-y-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Logo / Branding */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                H
              </div>
              {activeDownloads.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-badge-red text-[11px] font-bold flex items-center justify-center rounded-full text-white">
                  {activeDownloads.length > 9 ? '9+' : activeDownloads.length}
                </span>
              )}
            </div>
            <div className="flex-1">
              <div className="font-bold text-base text-white">Hyperion</div>
              <div className="text-xs text-gray-400">Video Downloader</div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative
                  ${isActive
                    ? 'text-white font-semibold before:absolute before:-left-4 before:inset-y-0 before:w-1 before:bg-accent-blue before:rounded-r'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center text-xs flex-shrink-0 ${
                  isActive ? 'bg-accent-blue' : 'bg-gray-600'
                }`}>
                  {item.icon}
                </div>
                <span className="text-sm">{item.label}</span>
                {item.label === 'Queue' && activeDownloads.length > 0 && (
                  <span className="ml-auto text-xs bg-accent-blue text-white px-1.5 py-0.5 rounded-full font-medium">
                    {activeDownloads.length}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Dark Mode Toggle */}
        <div className="pt-4 border-t border-gray-600 dark:border-gray-700">
          <div className="flex items-center gap-3 px-3 py-2">
            <ThemeToggle />
          </div>
          <div className="text-center mt-2">
            <div className="text-xs text-gray-500">Hyperion v1.0.0</div>
          </div>
        </div>
      </aside>
    </>
  );
}
