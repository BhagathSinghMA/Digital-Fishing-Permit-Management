import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppHeader } from './AppHeader';
import { Sidebar } from './Sidebar';

export const HarbourOfficerLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <AppHeader
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isSidebarOpen={isMobileSidebarOpen}
      />

      <div className="flex-1 flex">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <div className="relative z-10 w-64 bg-tnnavy-950 h-full">
              <Sidebar
                isCollapsed={false}
                onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
