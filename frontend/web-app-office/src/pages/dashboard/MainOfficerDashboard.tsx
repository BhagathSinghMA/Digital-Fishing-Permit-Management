import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { permitService } from '../../services/permit';
import { MainOfficerDashboardKPIs } from '../../types';
import { MetricCard } from '../../components/cards/MetricCard';
import { Button } from '../../components/common/Button';
import toast from 'react-hot-toast';
import {
  Ship,
  Users,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  BarChart3,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const MainOfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MainOfficerDashboardKPIs | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await permitService.getMainOfficerDashboardKPIs();
      setStats(data);
    } catch (err: any) {
      toast.error('Failed to load state-wide analytics telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-tnnavy-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-gov-lg border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-purple-500 text-white uppercase tracking-wider">
                Statewide Directorate Apex
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Tamil Nadu Maritime Fleet Registry
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              State Directorate Command Console
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Consolidated telemetry, harbour-wise vessel distribution, and master registries across all Tamil Nadu coastal ports.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/boat-owners')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Ship className="w-4 h-4" />}
            >
              Manage Boat Owners
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/fishermen')}
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Users className="w-4 h-4" />}
            >
              Manage Fishermen
            </Button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Boat Owners"
          value={isLoading ? '-' : stats?.totalBoatOwners ?? 0}
          subtitle="Registered across TN"
          icon={Ship}
          variant="primary"
          onClick={() => navigate('/admin/boat-owners')}
        />
        <MetricCard
          title="Total Fishermen"
          value={isLoading ? '-' : stats?.totalFishermen ?? 0}
          subtitle="Biometrically registered"
          icon={Users}
          variant="info"
          onClick={() => navigate('/admin/fishermen')}
        />
        <MetricCard
          title="Active Boat Owners"
          value={isLoading ? '-' : stats?.activeBoatOwners ?? 0}
          subtitle="Compliant & sea-ready"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/admin/boat-owners')}
        />
        <MetricCard
          title="Blocked Boat Owners"
          value={isLoading ? '-' : stats?.blockedBoatOwners ?? 0}
          subtitle="Suspended vessels"
          icon={XCircle}
          variant="danger"
          onClick={() => navigate('/admin/boat-owners')}
        />
        <MetricCard
          title="Blocked Fishermen"
          value={isLoading ? '-' : stats?.blockedFishermen ?? 0}
          subtitle="State-wide blacklist"
          icon={ShieldAlert}
          variant="warning"
          onClick={() => navigate('/admin/fishermen')}
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Harbour-wise Boat Owners Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-tnnavy-600" />
                Harbour-wise Boat Owners Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Vessel count categorized by official Tamil Nadu harbours
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.harbourBoatDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="harbour"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f2742',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Total Vessels" fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="active" name="Active (Operational)" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Harbour-wise Fishermen Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-tnnavy-600" />
                Harbour-wise Fishermen Crew Registry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Registered crew workforce deployment across coastal stations
              </p>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats?.harbourFishermanDistribution || []}
                margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="harbour"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f2742',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Registered Fishermen" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
