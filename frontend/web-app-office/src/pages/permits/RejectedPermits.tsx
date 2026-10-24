import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { permitService } from '../../services/permit';
import { Permit } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PermitDetailDrawer } from './PermitDetailDrawer';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDateTime, formatDateOnly } from '../../utils/formatters';
import toast from 'react-hot-toast';
import {
  XCircle,
  Search,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  Download,
  X,
  Ship,
  Users,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

export const RejectedPermits: React.FC = () => {
  const { user } = useAuth();
  const isApexOfficer = user?.role === 'MAIN_OFFICER' || user?.role === 'SUPER_ADMIN';

  // Active Harbour reflects user assigned harbour from context
  const [selectedHarbour, setSelectedHarbour] = useState<string>('');
  const activeHarbour = isApexOfficer ? selectedHarbour : (user?.assignedHarbour || 'Rameswaram');

  // Synchronize with harbour station in AppHeader
  useEffect(() => {
    if (!isApexOfficer && user?.assignedHarbour) {
      setSelectedHarbour(user.assignedHarbour);
    }
  }, [user?.assignedHarbour, isApexOfficer]);

  const [permits, setPermits] = useState<Permit[]>([]);
  const [allRejectedForStats, setAllRejectedForStats] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Helper to format local calendar date as YYYY-MM-DD
  const formatLocalDate = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = formatLocalDate(new Date());
  const yesterdayObj = new Date();
  yesterdayObj.setDate(yesterdayObj.getDate() - 1);
  const yesterdayStr = formatLocalDate(yesterdayObj);

  // Fetch KPI stats overview
  const fetchStatsOverview = async () => {
    try {
      const res = await permitService.getPermits({
        harbour: activeHarbour || undefined,
        status: 'REJECTED',
        size: 300,
      });
      setAllRejectedForStats(res.content);
    } catch (e) {
      console.error('Failed to fetch rejected stats', e);
    }
  };

  // Fetch Rejected Permits
  const fetchRejectedPermits = async () => {
    setIsLoading(true);
    try {
      const response = await permitService.getPermits({
        harbour: activeHarbour || undefined,
        status: 'REJECTED',
        search: debouncedSearch,
        date: selectedDate || undefined,
        page: currentPage,
        size: pageSize,
      });
      setPermits(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load rejected permits audit log.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsOverview();
  }, [activeHarbour]);

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedDate, activeHarbour]);

  useEffect(() => {
    fetchRejectedPermits();
  }, [activeHarbour, debouncedSearch, selectedDate, currentPage, pageSize]);

  // Derived Statistics
  const stats = useMemo(() => {
    const todayRejectedCount = allRejectedForStats.filter((p) => {
      const pDate = p.permitDate ? p.permitDate.substring(0, 10) : '';
      return pDate === todayStr;
    }).length;

    let selectedDateCount = 0;
    if (selectedDate) {
      selectedDateCount = allRejectedForStats.filter((p) => {
        const pDate = p.permitDate ? p.permitDate.substring(0, 10) : '';
        return pDate === selectedDate;
      }).length;
    }

    return {
      total: allRejectedForStats.length,
      today: todayRejectedCount,
      selectedDateCount,
    };
  }, [allRejectedForStats, selectedDate, todayStr]);

  // Quick date selector handlers
  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  const handleSetYesterday = () => {
    setSelectedDate(yesterdayStr);
  };

  const handleClearDate = () => {
    setSelectedDate('');
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (permits.length === 0) {
      toast.error('No rejected permits to export.');
      return;
    }

    const headers = [
      'Permit Number',
      'Registration Number',
      'Boat Name',
      'Owner Name',
      'Owner Phone',
      'Harbour Port',
      'Submitted Date',
      'Rejection Reason',
    ];

    const rows = permits.map((p) => [
      p.permitNumber || `TN-FP-2026-${p.id}`,
      p.registrationNumber,
      `"${p.boatName || ''}"`,
      `"${p.ownerName || ''}"`,
      p.ownerPhone || '',
      p.port || '',
      `"${p.submittedTime || p.permitDate || ''}"`,
      `"${p.rejectionReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rejected_Permits_${selectedDate || 'all'}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rejected permits exported to CSV.');
  };

  const columns: Column<Permit>[] = [
    {
      header: 'Permit Details',
      accessor: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-rose-900 bg-rose-50 px-2.5 py-1 rounded border border-rose-200 inline-block">
            {row.permitNumber || `TN-FP-2026-${String(row.id).padStart(6, '0')}`}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Applied: {row.submittedTime || row.permitDate || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Boat Registration',
      accessor: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-rose-600" />
            <span className="font-mono text-xs font-bold text-slate-900">{row.registrationNumber}</span>
          </div>
          <span className="text-xs text-slate-500 block pl-5">{row.boatName}</span>
        </div>
      ),
    },
    {
      header: 'Boat Owner',
      accessor: (row) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 block">{row.ownerName}</span>
          <span className="text-[11px] text-slate-500 font-mono">{row.ownerPhone || 'N/A'}</span>
        </div>
      ),
    },
    {
      header: 'Harbour / Port',
      accessor: (row) => (
        <span className="text-xs font-medium text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-200">
          {row.port || 'Tamil Nadu'}
        </span>
      ),
    },
    {
      header: 'Application Date',
      accessor: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {row.permitDate ? formatDateOnly(row.permitDate) : 'N/A'}
          </span>
          <span className="text-[11px] text-slate-500">
            {row.createdAt ? formatDateTime(row.createdAt) : row.submittedTime}
          </span>
        </div>
      ),
    },
    {
      header: 'Reject Reason',
      accessor: (row) => (
        <div className="max-w-md">
          <p className="text-xs text-rose-950 font-medium line-clamp-2 leading-relaxed bg-rose-50/70 p-2 rounded-lg border border-rose-100">
            {row.rejectionReason || 'Did not meet safety or regulatory requirements.'}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => <Badge status={row.status} size="sm" />,
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedPermit(row);
            setIsDrawerOpen(true);
          }}
          className="h-8 px-2.5 text-xs hover:border-rose-600 hover:text-rose-700"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Rejected Permit Applications & History
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit log of denied permit requests and regulatory rejection rationales.
                {activeHarbour && (
                  <span className="ml-1 font-semibold text-slate-700">
                    • Port: <span className="text-rose-700 font-bold">{activeHarbour}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="h-9 px-3 text-xs flex items-center gap-1.5"
            leftIcon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchRejectedPermits();
              fetchStatsOverview();
            }}
            className="h-9 px-3"
            title="Refresh Rejected Permits"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-rose-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Today Rejected */}
        <div
          onClick={() => {
            handleSetToday();
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedDate === todayStr
              ? 'bg-rose-500/10 border-rose-500/40 shadow-sm ring-2 ring-rose-400/30'
              : 'bg-white border-slate-200 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              Today's Denied Requests
            </span>
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.today}</span>
            <span className="text-[11px] font-medium text-rose-700">Today ({formatDateOnly(todayStr)})</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Applications denied during today's shift</p>
        </div>

        {/* Card 2: Full Rejected Archive */}
        <div
          onClick={() => {
            handleClearDate();
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            !selectedDate
              ? 'bg-tnnavy-500/10 border-tnnavy-500/40 shadow-sm ring-2 ring-tnnavy-400/30'
              : 'bg-white border-slate-200 hover:border-tnnavy-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-tnnavy-900">
              Total Rejected Archive
            </span>
            <span className="p-1.5 rounded-lg bg-tnnavy-100 text-tnnavy-800">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] font-medium text-tnnavy-700">All Past Denials</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Complete historical record of rejected permits</p>
        </div>
      </div>

      {/* Top Filter Controls Section */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Calendar Date Picker Bar */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 transition-colors">
              <Calendar className="w-4 h-4 text-rose-600 shrink-0" />
              <label htmlFor="rejected-calendar-date-input" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Select Date:
              </label>
              <input
                id="rejected-calendar-date-input"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 outline-none cursor-pointer"
              />
            </div>

            {/* Quick date shortcuts */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleSetToday}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  selectedDate === todayStr
                    ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleSetYesterday}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                  selectedDate === yesterdayStr
                    ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Yesterday
              </button>
              {selectedDate && (
                <button
                  type="button"
                  onClick={handleClearDate}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear Date
                </button>
              )}
            </div>
          </div>

          {/* Search Field */}
          <div className="w-full lg:w-72">
            <Input
              placeholder="Search permit #, boat, owner..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="h-9 text-xs"
            />
          </div>
        </div>

        {/* Active Filter Indicators */}
        {selectedDate && (
          <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-rose-600" />
              <span>
                Showing <strong>Rejected Permits</strong> for particular date: <strong>{formatDateOnly(selectedDate)}</strong> ({selectedDate}).
              </span>
            </div>
            <button
              onClick={handleClearDate}
              className="p-1 rounded-md hover:bg-rose-200 text-rose-700 transition-colors"
              title="View all rejected records"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={permits}
        isLoading={isLoading}
        emptyTitle={
          selectedDate
            ? `No Rejected Permits on ${formatDateOnly(selectedDate)}`
            : 'No Rejected Permits Found'
        }
        emptyDescription={
          selectedDate
            ? `There were no denied permit applications recorded on ${selectedDate} for ${activeHarbour} harbour.`
            : `There are no rejected permit records for ${activeHarbour} harbour.`
        }
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

      {/* Permit Detail Drawer */}
      <PermitDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        permit={selectedPermit}
      />
    </div>
  );
};
