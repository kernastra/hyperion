"use client";

import { SidebarNavigation } from "./sidebar-navigation";

interface MainLayoutProps {
  children: React.ReactNode;
  rightSidebar?: React.ReactNode;
}

export function MainLayout({ children, rightSidebar }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-page-bg dark:bg-night-black font-inter transition-colors">
      <div className="min-h-screen lg:p-2">
        <div className="lg:flex lg:gap-3 xl:gap-4 h-full lg:min-h-[calc(100vh-1rem)]">
          
          {/* Left Navigation Rail */}
          <SidebarNavigation />

          {/* Main Content Area */}
          <main className="flex-1 bg-card-bg dark:bg-gray-800 lg:rounded-xl p-4 lg:p-6 pb-20 lg:pb-6 lg:shadow-[0_4px_16px_rgba(17,24,39,0.08)] dark:lg:shadow-[0_4px_16px_rgba(0,0,0,0.3)] min-h-screen lg:min-h-0 overflow-y-auto transition-colors">
            {children}
          </main>

          {/* Right Sidebar (Optional) */}
          {rightSidebar && (
            <aside className="hidden lg:block lg:sticky lg:top-2 w-[320px] xl:w-[350px] h-[calc(100vh-1rem)] bg-card-bg dark:bg-gray-800 rounded-xl p-4 xl:p-5 transition-colors lg:flex-shrink-0 overflow-y-auto"
                   style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {rightSidebar}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
