import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Anchor, Shield, User, LogOut, ChevronDown, Bell, Check, MapPin, Building } from 'lucide-react';
import { ALL_HARBOURS } from '../../utils/constants';

interface AppHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout, updateHarbour, switchRoleDemo } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHarbourMenuOpen, setIsHarbourMenuOpen] = useState(false);

  const isOfficer = user?.role === 'OFFICER';

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Department Emblem and Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
            aria-label="Toggle sidebar"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            {/* Government Emblem / Marine Icon */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tnnavy-800 to-tnnavy-950 text-amber-400 flex items-center justify-center shadow-md shrink-0 border border-tnnavy-700">
              <Anchor className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Govt of Tamil Nadu
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">•</span>
                <span className="text-xs font-semibold text-slate-600 hidden sm:inline">
                  {isOfficer ? 'Permit Office Portal' : 'Main Officer Portal (Directorate)'}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-none mt-0.5">
                Department of Fisheries & Fishermen Welfare
              </h1>
            </div>
          </div>
        </div>

        {/* Right: Harbour Lock Badge, Demo Switcher, Officer Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Harbour Badge for Officers (Strict Isolation) */}
          {isOfficer && user?.assignedHarbour && (
            <div className="relative">
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-sky-50 border border-sky-200 px-3 py-1.5 rounded-xl shadow-xs">
                <div className="p-1 rounded-md bg-sky-600 text-white shrink-0">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-sky-800">
                    Station Harbour
                  </div>
                  <div className="text-xs font-extrabold text-sky-950 truncate max-w-[160px]">
                    {user.assignedHarbour}
                  </div>
                </div>

                {/* Quick harbour switcher for testing/demoing officer harbour data isolation */}
                <button
                  onClick={() => setIsHarbourMenuOpen(!isHarbourMenuOpen)}
                  title="Switch Harbour Station (Demo Testing)"
                  className="ml-1 p-1 hover:bg-sky-200/60 rounded text-sky-800 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Harbour Switcher Dropdown */}
              {isHarbourMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsHarbourMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Switch Officer Station (Demo)
                    </div>
                    <div className="max-h-60 overflow-y-auto py-1">
                      {ALL_HARBOURS.map((h) => (
                        <button
                          key={h}
                          onClick={() => {
                            updateHarbour(h);
                            setIsHarbourMenuOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-sky-50 ${
                            user.assignedHarbour === h ? 'font-bold text-sky-900 bg-sky-50/60' : 'text-slate-700'
                          }`}
                        >
                          <span className="truncate">{h}</span>
                          {user.assignedHarbour === h && <Check className="w-3.5 h-3.5 text-sky-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Senior Directorate Badge for Main Officer */}
          {!isOfficer && (
            <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-xl text-purple-900">
              <Building className="w-4 h-4 text-purple-600 shrink-0" />
              <div className="text-left hidden sm:block">
                <div className="text-[10px] font-bold uppercase tracking-wider text-purple-700">Scope</div>
                <div className="text-xs font-bold text-purple-950">Statewide (All Harbours)</div>
              </div>
            </div>
          )}

          {/* Quick Portal Switcher (For Pair-Programming & Demo Verification) */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => switchRoleDemo('OFFICER', user?.assignedHarbour || 'Rameswaram')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                isOfficer
                  ? 'bg-white text-tnnavy-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Permit Office
            </button>
            <button
              onClick={() => switchRoleDemo('MAIN_OFFICER')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                !isOfficer
                  ? 'bg-white text-purple-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Main Officer
            </button>
          </div>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2.5 p-1.5 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-tnnavy-900 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name || 'Officer'}</div>
                <div className="text-[10px] text-slate-500 font-mono">{user?.officerId || 'TN-OFFICER'}</div>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.officerId}</p>
                    <p className="text-[11px] text-tnnavy-700 font-medium mt-1">
                      Role: {user?.role === 'OFFICER' ? 'Harbour Fisheries Officer' : 'Senior Directorate Officer'}
                    </p>
                    {user?.assignedHarbour && (
                      <p className="text-[11px] text-sky-700 font-medium">
                        Harbour: {user.assignedHarbour}
                      </p>
                    )}
                  </div>

                  <div className="px-2 pt-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
