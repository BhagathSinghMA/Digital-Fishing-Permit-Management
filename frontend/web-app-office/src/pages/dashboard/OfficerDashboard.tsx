import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { permitService } from '../../services/permit';
import { OfficerDashboardKPIs, Permit } from '../../types';
import { MetricCard } from '../../components/cards/MetricCard';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ApproveModal } from '../../components/dialogs/ApproveModal';
import { RejectReasonModal } from '../../components/dialogs/RejectReasonModal';
import { PermitDetailDrawer } from '../permits/PermitDetailDrawer';
import toast from 'react-hot-toast';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Ship,
  ShieldAlert,
  Users,
  Radio,
  Eye,
  Check,
  X,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const harbour = user?.assignedHarbour || 'Rameswaram';

  const [stats, setStats] = useState<OfficerDashboardKPIs | null>(null);
  const [recentPermits, setRecentPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTogglingWindow, setIsTogglingWindow] = useState(false);

  // Modals / Drawer state
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [kpis, permitsData] = await Promise.all([
        permitService.getOfficerDashboardKPIs(harbour),
        permitService.getPermits({ harbour, status: 'PENDING', page: 0, size: 5 }),
      ]);
      setStats(kpis);
      setRecentPermits(permitsData.content);
    } catch (err: any) {
      toast.error('Failed to load harbour dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [harbour]);

  const handleToggleWindow = async () => {
    if (!stats) return;
    setIsTogglingWindow(true);
    const newStatus = !stats.permitApplicationOpen;
    try {
      await permitService.togglePermitWindow(newStatus);
      setStats({ ...stats, permitApplicationOpen: newStatus });
      toast.success(
        newStatus
          ? 'Maritime permit applications are now OPEN for fishermen.'
          : 'Maritime permit applications are now CLOSED.'
      );
    } catch (err: any) {
      toast.error('Failed to update permit application window.');
    } finally {
      setIsTogglingWindow(false);
    }
  };

  const handleApproveConfirm = async () => {
    if (!selectedPermit) return;
    setIsActionLoading(true);
    try {
      await permitService.approvePermit(selectedPermit.id);
      toast.success(`Permit #${selectedPermit.id} approved successfully!`);
      setIsApproveOpen(false);
      setIsDrawerOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Approval failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedPermit) return;
    setIsActionLoading(true);
    try {
      await permitService.rejectPermit(selectedPermit.id, reason);
      toast.success(`Permit #${selectedPermit.id} rejected.`);
      setIsRejectOpen(false);
      setIsDrawerOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: Column<Permit>[] = [
    {
      header: 'Permit / Vessel',
      accessor: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-tnnavy-900 block">
            {row.permitNumber || `TN-FP-2026-${String(row.id).padStart(6, '0')}`}
          </span>
          <span className="text-xs font-semibold text-slate-800">{row.boatName}</span>
          <span className="font-mono text-[11px] text-slate-500 block">{row.registrationNumber}</span>
        </div>
      ),
    },
    {
      header: 'Boat Owner',
      accessor: (row) => (
        <div>
          <span className="font-medium text-slate-900 block">{row.ownerName}</span>
          <span className="text-xs text-slate-500 font-mono">{row.ownerPhone || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Crew Size',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.crewCount} crew
        </span>
      ),
    },
    {
      header: 'Applied Time',
      accessor: 'submittedTime',
      className: 'text-xs text-slate-600',
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.status} size="sm" />,
    },
    {
      header: 'Action',
      accessor: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPermit(row);
              setIsDrawerOpen(true);
            }}
            className="h-7 px-2 text-xs"
            leftIcon={<Eye className="w-3 h-3" />}
          >
            Review
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => {
              setSelectedPermit(row);
              setIsApproveOpen(true);
            }}
            className="h-7 px-2 text-xs"
            title="Quick Approve"
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedPermit(row);
              setIsRejectOpen(true);
            }}
            className="h-7 px-2 text-xs"
            title="Quick Reject"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Harbour Information & Application Window Master Switch */}
      <div className="bg-gradient-to-r from-tnnavy-900 via-tnnavy-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-gov-lg border border-tnnavy-800 relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-sky-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
                Station Control
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Tamil Nadu Fisheries & Maritime Authority
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {harbour} Command Dashboard
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl mt-1">
              Real-time maritime permit processing, vessel departure clearance, and biometric crew verification strictly scoped to <span className="font-bold text-amber-300">{harbour}</span>.
            </p>
          </div>

          {/* Master Permit Application Toggle */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 flex items-center justify-between gap-6 shrink-0">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                Permit Window (Mobile App)
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    stats?.permitApplicationOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <span className="text-sm font-bold text-white">
                  {stats?.permitApplicationOpen ? 'APPLICATIONS OPEN' : 'APPLICATIONS CLOSED'}
                </span>
              </div>
            </div>

            <Button
              variant={stats?.permitApplicationOpen ? 'danger' : 'success'}
              size="sm"
              onClick={handleToggleWindow}
              isLoading={isTogglingWindow}
              className="text-xs px-3.5 py-2 font-bold shadow-md"
            >
              {stats?.permitApplicationOpen ? 'CLOSE WINDOW' : 'OPEN WINDOW'}
            </Button>
          </div>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Pending Queue"
          value={isLoading ? '-' : stats?.pendingPermits ?? 0}
          subtitle="Awaiting Verification"
          icon={Clock}
          variant="warning"
          onClick={() => navigate('/office/permits/pending')}
        />
        <MetricCard
          title="Approved Today"
          value={isLoading ? '-' : stats?.approvedToday ?? 0}
          subtitle="Valid 24h Passes"
          icon={CheckCircle2}
          variant="success"
          onClick={() => navigate('/office/permits/approved')}
        />
        <MetricCard
          title="Rejected Today"
          value={isLoading ? '-' : stats?.rejectedToday ?? 0}
          subtitle="Denied Requests"
          icon={XCircle}
          variant="danger"
          onClick={() => navigate('/office/permits/rejected')}
        />
        <MetricCard
          title="Boat Owners"
          value={isLoading ? '-' : stats?.harbourBoatOwners ?? 0}
          subtitle={`In ${harbour}`}
          icon={Ship}
          variant="primary"
          onClick={() => navigate('/office/boat-owners')}
        />
        <MetricCard
          title="Blocked Fishermen"
          value={isLoading ? '-' : stats?.harbourBlockedFishermen ?? 0}
          subtitle="Flagged Violations"
          icon={ShieldAlert}
          variant="danger"
          onClick={() => navigate('/office/blocked')}
        />
        <MetricCard
          title="Registered Crew"
          value={isLoading ? '-' : stats?.harbourRegisteredFishermen ?? 0}
          subtitle={`In ${harbour}`}
          icon={Users}
          variant="info"
          onClick={() => navigate('/office/fishermen/search')}
        />
      </div>

      {/* Pending Permits Table Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Incoming Pending Permits ({harbour})
            </h3>
            <p className="text-xs text-slate-500">
              Applications requiring officer safety check, vessel manifest verification, and QR issuance.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/office/permits/pending')}
            rightIcon={<ArrowUpRight className="w-4 h-4" />}
          >
            View Full Queue
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={recentPermits}
          isLoading={isLoading}
          emptyTitle="No Pending Permits in Queue"
          emptyDescription={`All permit requests for ${harbour} harbour have been cleared.`}
          onRowClick={(row) => {
            setSelectedPermit(row);
            setIsDrawerOpen(true);
          }}
        />
      </div>

      {/* Modals & Slide-Over Drawer */}
      <PermitDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        permit={selectedPermit}
        onApprove={() => setIsApproveOpen(true)}
        onReject={() => setIsRejectOpen(true)}
      />

      <ApproveModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApproveConfirm}
        permit={selectedPermit}
        isLoading={isActionLoading}
      />

      <RejectReasonModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleRejectConfirm}
        permit={selectedPermit}
        isLoading={isActionLoading}
      />
    </div>
  );
};
