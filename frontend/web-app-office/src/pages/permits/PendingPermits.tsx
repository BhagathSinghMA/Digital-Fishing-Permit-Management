import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { permitService } from '../../services/permit';
import { Permit } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { ApproveModal } from '../../components/dialogs/ApproveModal';
import { RejectReasonModal } from '../../components/dialogs/RejectReasonModal';
import { PermitDetailDrawer } from './PermitDetailDrawer';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  Clock,
  Search,
  Eye,
  Check,
  X,
  Users,
  RefreshCw,
  Anchor,
  Ship,
} from 'lucide-react';

export const PendingPermits: React.FC = () => {
  const { user } = useAuth();
  const harbour = user?.assignedHarbour || 'Rameswaram';

  const [permits, setPermits] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modals & Drawer state
  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchPendingPermits = async () => {
    setIsLoading(true);
    try {
      const response = await permitService.getPermits({
        harbour,
        status: 'PENDING',
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
      });
      setPermits(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load pending permit applications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, harbour]);

  useEffect(() => {
    fetchPendingPermits();
  }, [harbour, debouncedSearch, currentPage, pageSize]);

  const handleApproveConfirm = async () => {
    if (!selectedPermit) return;
    setIsActionLoading(true);
    try {
      const result = await permitService.approvePermit(selectedPermit.id);
      toast.success(`Permit approved! Official Number: ${result.permitNumber}`);
      setIsApproveOpen(false);
      setIsDrawerOpen(false);
      fetchPendingPermits();
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
      fetchPendingPermits();
    } catch (err: any) {
      toast.error(err.message || 'Rejection failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: Column<Permit>[] = [
    {
      header: 'Permit ID',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-tnnavy-900 bg-tnnavy-50 px-2.5 py-1 rounded border border-tnnavy-200">
          {row.permitNumber || `TN-FP-2026-${String(row.id).padStart(6, '0')}`}
        </span>
      ),
    },
    {
      header: 'Boat Number',
      accessor: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">{row.registrationNumber}</span>
          <span className="text-xs text-slate-500">{row.boatName}</span>
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
      header: 'Crew Count',
      accessor: (row) => (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          {row.crewCount} crew
        </span>
      ),
    },
    {
      header: 'Harbour',
      accessor: (row) => (
        <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          {row.port}
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
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPermit(row);
              setIsDrawerOpen(true);
            }}
            className="h-8 px-2.5 text-xs"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={() => {
              setSelectedPermit(row);
              setIsApproveOpen(true);
            }}
            className="h-8 px-2.5 text-xs"
            leftIcon={<Check className="w-3.5 h-3.5" />}
          >
            Approve
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSelectedPermit(row);
              setIsRejectOpen(true);
            }}
            className="h-8 px-2.5 text-xs"
            leftIcon={<X className="w-3.5 h-3.5" />}
          >
            Reject
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Pending Fishing Permits
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
              {totalElements} Awaiting Review
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Harbour Station: <span className="font-semibold text-slate-800">{harbour}</span> • Verify vessel crew member details before approving.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              placeholder="Search by reg number, boat or owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPendingPermits}
            title="Refresh queue"
            className="h-10 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={permits}
        isLoading={isLoading}
        emptyTitle="No Pending Permits in Queue"
        emptyDescription={`There are currently no pending departure applications for ${harbour} harbour.`}
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(row) => {
          setSelectedPermit(row);
          setIsDrawerOpen(true);
        }}
      />

      {/* Slide-Over Drawer for Permit Details & Verification */}
      <PermitDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        permit={selectedPermit}
        onApprove={() => setIsApproveOpen(true)}
        onReject={() => setIsRejectOpen(true)}
      />

      {/* Confirmation Modals */}
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
