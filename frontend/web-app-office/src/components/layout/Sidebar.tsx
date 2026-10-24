import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Clock,
  CheckCircle2,
  XCircle,
  Ship,
  Search,
  ShieldAlert,
  Users,
  ChevronLeft,
  ChevronRight,
  Anchor,
  Radio,
  FileSpreadsheet,
  History,
} from 'lucide-react';

interface MenuItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
  harbourOnly?: boolean;
}

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();
  const location = useLocation();

  const isOfficer = user?.role === 'OFFICER';

  // Menu items for Portal 1: Permit Office Portal
  const officerMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/office/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Pending Permits',
      path: '/office/permits/pending',
      icon: Clock,
      badge: 'Queue',
    },
    {
      label: 'Approved Permits',
      path: '/office/permits/approved',
      icon: CheckCircle2,
    },
    {
      label: 'Rejected Permits',
      path: '/office/permits/rejected',
      icon: XCircle,
    },
    {
      label: 'Permit History',
      path: '/office/permits/history',
      icon: History,
    },
    {
      label: 'Boat Owners',
      path: '/office/boat-owners',
      icon: Ship,
      harbourOnly: true,
    },
    {
      label: 'Fisherman Search',
      path: '/office/fishermen/search',
      icon: Search,
    },
    {
      label: 'Blocked Fishermen',
      path: '/office/blocked',
      icon: ShieldAlert,
    },
  ];

  // Menu items for Portal 2: Main Officer Portal
  const mainOfficerMenuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Boat Owners',
      path: '/admin/boat-owners',
      icon: Ship,
    },
    {
      label: 'Fishermen',
      path: '/admin/fishermen',
      icon: Users,
    },
  ];

  const currentMenuItems = isOfficer ? officerMenuItems : mainOfficerMenuItems;

  return (
    <aside
      className={`sticky top-16 h-[calc(100vh-4rem)] bg-tnnavy-950 text-slate-200 border-r border-tnnavy-900 transition-all duration-300 flex flex-col justify-between z-30 shrink-0 select-none shadow-xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Section: Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-3 mb-2 border-b border-tnnavy-900 flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400/90 block">
                {isOfficer ? 'Harbour Port Unit' : 'Apex Directorate'}
              </span>
              <span className="text-xs font-bold text-white tracking-tight">
                {isOfficer ? user?.assignedHarbour || 'Coastal Station' : 'State Control Center'}
              </span>
            </div>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg bg-tnnavy-900 hover:bg-tnnavy-800 text-slate-400 hover:text-white transition-colors ml-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <nav className="space-y-1">
          {currentMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-tnmaritime-600 to-tnmaritime-700 text-white shadow-md'
                    : 'text-slate-300 hover:bg-tnnavy-900 hover:text-white'
                }`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-amber-400/20 text-amber-300 rounded border border-amber-400/30">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      {!isCollapsed && (
        <div className="p-4 m-3 rounded-2xl bg-tnnavy-900/90 border border-tnnavy-800 text-xs text-slate-400 space-y-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-slate-200 text-[11px]">Maritime Telemetry Active</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Encrypted official channel for Fisheries Department of Tamil Nadu.
          </p>
        </div>
      )}
    </aside>
  );
};
