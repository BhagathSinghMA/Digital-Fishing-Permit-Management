import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { ALL_HARBOURS } from '../../utils/constants';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Anchor, ShieldCheck, Lock, User, Building, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('OFFICER');
  const [assignedHarbour, setAssignedHarbour] = useState('Rameswaram');
  const [username, setUsername] = useState('officer_rameswaram');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'OFFICER') {
      setUsername(`officer_${assignedHarbour.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    } else {
      setUsername('senior_dir_fisheries');
    }
  };

  const handleHarbourChange = (newHarbour: string) => {
    setAssignedHarbour(newHarbour);
    if (role === 'OFFICER') {
      setUsername(`officer_${newHarbour.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      if (role === 'OFFICER') {
        login({
          id: 1,
          username: username || 'officer_station',
          name: 'K. Rajasekaran',
          role: 'OFFICER',
          assignedHarbour: assignedHarbour,
          phoneNumber: '9443198765',
          officerId: `TN-FO-${assignedHarbour.slice(0, 3).toUpperCase()}-042`,
          token: 'mock-jwt-token-officer',
        });
        toast.success(`Welcome, Officer Rajasekaran (${assignedHarbour} Harbour)`);
        navigate('/office/dashboard');
      } else {
        login({
          id: 99,
          username: username || 'senior_dir',
          name: 'Dr. V. Prabhakaran, IAS',
          role: 'MAIN_OFFICER',
          assignedHarbour: undefined,
          phoneNumber: '9840998877',
          officerId: 'TN-HQ-DIR-001',
          token: 'mock-jwt-token-main-officer',
        });
        toast.success('Welcome, Dr. Prabhakaran (State Directorate Apex)');
        navigate('/admin/dashboard');
      }
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-tnnavy-950 via-slate-900 to-tnnavy-900 flex flex-col justify-center items-center p-4 sm:p-6 select-none relative overflow-hidden">
      {/* Decorative wave glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Top Government Seal & Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-tnnavy-800 to-tnnavy-950 text-amber-400 border border-tnnavy-700 shadow-2xl mb-2">
            <Anchor className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
              Government of Tamil Nadu
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Fisherman Permit Management System
          </h1>
          <p className="text-xs text-slate-400">
            Department of Fisheries and Fishermen Welfare
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200/80 space-y-6">
          {/* Portal Selector Tabs */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Select Official Portal Role:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => handleRoleChange('OFFICER')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  role === 'OFFICER'
                    ? 'bg-white text-tnnavy-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                Permit Office
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('MAIN_OFFICER')}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  role === 'MAIN_OFFICER'
                    ? 'bg-white text-purple-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building className="w-3.5 h-3.5 text-purple-600" />
                Main Officer
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {role === 'OFFICER' && (
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1.5">
                  Assigned Harbour Station <span className="text-rose-500">*</span>
                </label>
                <select
                  value={assignedHarbour}
                  onChange={(e) => handleHarbourChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-tnnavy-500"
                >
                  {ALL_HARBOURS.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Harbour Isolation: You will only see data for {assignedHarbour}.
                </p>
              </div>
            )}

            <Input
              label="Official Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full py-3 rounded-xl font-bold shadow-md mt-2"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Authenticate & Access Portal
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Authorized Government Personnel Only • Secured with 256-bit TLS Encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
