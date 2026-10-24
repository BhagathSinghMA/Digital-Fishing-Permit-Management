import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fishermanService } from '../../services/fisherman';
import { BlockedFishermanRecord } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmationDialog } from '../../components/dialogs/ConfirmationDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime, formatPhoneNumber } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { ShieldAlert, ShieldCheck, Search, Eye, RefreshCw } from 'lucide-react';

export const BlockedFishermen: React.FC = () => {
  const { user } = useAuth();
  const harbour = user?.assignedHarbour || 'Rameswaram';

  const [records, setRecords] = useState<BlockedFishermanRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modals state
  const [selectedRecord, setSelectedRecord] = useState<BlockedFishermanRecord | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isUnblockOpen, setIsUnblockOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchBlockedList = async () => {
    setIsLoading(true);
    try {
      const response = await fishermanService.getBlockedFishermen({
        harbour,
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
      });
      setRecords(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load blocked fishermen registry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, harbour]);

  useEffect(() => {
    fetchBlockedList();
  }, [harbour, debouncedSearch, currentPage, pageSize]);

  const handleUnblockConfirm = async () => {
    if (!selectedRecord) return;
    setIsActionLoading(true);
    try {
      await fishermanService.unblockFisherman(selectedRecord.fishermanId);
      toast.success(`Fisherman ${selectedRecord.name} (${selectedRecord.fishermanId}) has been unblocked.`);
      setIsUnblockOpen(false);
      setSelectedRecord(null);
      fetchBlockedList();
    } catch (err: any) {
      toast.error('Failed to unblock fisherman.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const columns: Column<BlockedFishermanRecord>[] = [
    {
      header: 'Fisherman ID',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
          {row.fishermanId}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (row) => <span className="font-semibold text-slate-900 text-xs">{row.name}</span>,
    },
    {
      header: 'Harbour Station',
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700">{row.harbour}</span>
      ),
    },
    {
      header: 'Block Date',
      accessor: (row) => (
        <span className="text-xs text-slate-600 font-mono">{formatDateTime(row.blockDate)}</span>
      ),
    },
    {
      header: 'Reason',
      accessor: (row) => (
        <div className="max-w-md">
          <p className="text-xs text-rose-800 line-clamp-2 leading-relaxed">{row.reason}</p>
        </div>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRecord(row);
              setIsViewOpen(true);
            }}
            className="h-8 px-2.5 text-xs"
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRecord(row);
              setIsUnblockOpen(true);
            }}
            className="h-8 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-300"
            leftIcon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
          >
            Unblock
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Blocked Fishermen Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
              {totalElements} Suspended
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Harbour Station: <span className="font-semibold text-slate-800">{harbour}</span> • Individuals suspended from participating in maritime fishing permits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              placeholder="Search by ID, name, or violation..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBlockedList}
            className="h-10 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        emptyTitle="No Blocked Fishermen in Harbour"
        emptyDescription={`There are currently no suspended or blacklisted fishermen registered under ${harbour} harbour.`}
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(row) => {
          setSelectedRecord(row);
          setIsViewOpen(true);
        }}
      />

      {/* View Detail Modal */}
      {selectedRecord && (
        <Modal
          isOpen={isViewOpen}
          onClose={() => setIsViewOpen(false)}
          title={`Suspension Record: ${selectedRecord.name}`}
          subtitle={`Govt ID: ${selectedRecord.fishermanId}`}
          maxWidth="md"
          footer={
            <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
              <span className="font-bold text-sm block">Flagged Non-Compliance Rationale:</span>
              <p className="leading-relaxed">{selectedRecord.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Harbour Assigned:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.harbour}</span>
              </div>
              <div>
                <span className="text-slate-500 block">District:</span>
                <span className="font-semibold text-slate-800">{selectedRecord.district}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Suspension Date:</span>
                <span className="font-mono text-slate-800">{formatDateTime(selectedRecord.blockDate)}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contact Phone:</span>
                <span className="font-mono text-slate-800">{formatPhoneNumber(selectedRecord.phone)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Unblock Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isUnblockOpen}
        onClose={() => setIsUnblockOpen(false)}
        onConfirm={handleUnblockConfirm}
        title="Unblock Fisherman Record"
        message={`Are you sure you want to restore maritime permit clearance for ${selectedRecord?.name} (${selectedRecord?.fishermanId})? This will allow them to be re-added to vessel crew manifests.`}
        confirmText="Confirm & Unblock"
        variant="primary"
        isLoading={isActionLoading}
      />
    </div>
  );
};
