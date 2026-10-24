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
import { ALL_HARBOURS } from '../../utils/constants';
import toast from 'react-hot-toast';
import {
  History,
  Search,
  Eye,
  Users,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  X,
  ShieldCheck,
  Ship,
} from 'lucide-react';

type FilterMode = '48_HOURS_EXPIRED' | 'ALL_HISTORY';

export const PermitHistory: React.FC = () => {
  const { user } = useAuth();
  const isApexOfficer = user?.role === 'MAIN_OFFICER' || user?.role === 'SUPER_ADMIN';

  // For station officers, active harbour follows the officer station selected in the AppHeader
  const [selectedHarbour, setSelectedHarbour] = useState<string>('');
  const activeHarbour = isApexOfficer ? selectedHarbour : (user?.assignedHarbour || 'Rameswaram');

  // Synchronize when officer switches harbour station in AppHeader
  useEffect(() => {
    if (!isApexOfficer && user?.assignedHarbour) {
      setSelectedHarbour(user.assignedHarbour);
    }
  }, [user?.assignedHarbour, isApexOfficer]);

  const [filterMode, setFilterMode] = useState<FilterMode>('48_HOURS_EXPIRED');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 350);

  const [permits, setPermits] = useState<Permit[]>([]);
  const [allPermitsForStats, setAllPermitsForStats] = useState<Permit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedPermit, setSelectedPermit] = useState<Permit | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Helper to determine if permit expired within the last 48 hours
  const isExpiredInLast48Hours = (permit: Permit): boolean => {
    if (!permit.expiryDate) return false;
    const expiryTime = new Date(permit.expiryDate).getTime();
    if (isNaN(expiryTime)) return false;

    const now = Date.now();
    const diffMs = now - expiryTime;
    // Expired in past, and within 48 hours (48 * 3600 * 1000 ms)
    return diffMs >= 0 && diffMs <= 48 * 60 * 60 * 1000;
  };

  // Helper to format relative expired time
  const formatExpiredTimeAgo = (expiryDateStr?: string | null): string => {
    if (!expiryDateStr) return 'N/A';
    const expiry = new Date(expiryDateStr);
    if (isNaN(expiry.getTime())) return expiryDateStr;

    const diffMs = Date.now() - expiry.getTime();
    if (diffMs <= 0) return 'Valid (Not Expired)';

    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return `1 day ago`;
    return `${diffDays} days ago`;
  };

  // Fetch KPI stats overview
  const fetchStatsOverview = async () => {
    try {
      const res = await permitService.getPermits({
        harbour: activeHarbour || undefined,
        size: 300,
      });
      setAllPermitsForStats(res.content);
    } catch (e) {
      console.error('Failed to fetch permit stats', e);
    }
  };

  // Fetch Permits with applied filters
  const fetchPermits = async () => {
    setIsLoading(true);
    try {
      let statusParam: string | undefined = undefined;

      if (!selectedDate) {
        if (filterMode === '48_HOURS_EXPIRED') {
          statusParam = 'EXPIRED';
        }
      }

      // If a particular date is selected, we fetch full history for that date
      const response = await permitService.getPermits({
        harbour: activeHarbour || undefined,
        status: statusParam,
        search: debouncedSearch,
        date: selectedDate || undefined,
        page: filterMode === '48_HOURS_EXPIRED' ? 0 : currentPage,
        size: filterMode === '48_HOURS_EXPIRED' ? 200 : pageSize,
      });

      let items = response.content;

      // If client-side mode is specifically 48_HOURS_EXPIRED and no specific single date selected
      if (filterMode === '48_HOURS_EXPIRED' && !selectedDate) {
        // Filter strictly to items expired in last 48 hours ONLY
        const strictly48h = items.filter(isExpiredInLast48Hours);
        setTotalElements(strictly48h.length);
        setTotalPages(Math.max(1, Math.ceil(strictly48h.length / pageSize)));
        const startIndex = currentPage * pageSize;
        items = strictly48h.slice(startIndex, startIndex + pageSize);
      } else {
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      }

      setPermits(items);
    } catch (err: any) {
      toast.error('Failed to load permit history.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsOverview();
  }, [activeHarbour]);

  useEffect(() => {
    setCurrentPage(0);
  }, [filterMode, selectedDate, debouncedSearch, activeHarbour]);

  useEffect(() => {
    fetchPermits();
  }, [activeHarbour, filterMode, selectedDate, debouncedSearch, currentPage, pageSize]);

  // Derived Statistics
  const stats = useMemo(() => {
    const expiredCount = allPermitsForStats.filter((p) => p.status === 'EXPIRED').length;
    const last48hCount = allPermitsForStats.filter(
      (p) => p.status === 'EXPIRED' && isExpiredInLast48Hours(p)
    ).length;
    const approvedCount = allPermitsForStats.filter((p) => p.status === 'APPROVED').length;
    const rejectedCount = allPermitsForStats.filter((p) => p.status === 'REJECTED').length;

    let selectedDateCount = 0;
    if (selectedDate) {
      selectedDateCount = allPermitsForStats.filter((p) => {
        const pDate = p.permitDate ? p.permitDate.substring(0, 10) : '';
        const expDate = p.expiryDate ? p.expiryDate.substring(0, 10) : '';
        return pDate === selectedDate || expDate === selectedDate;
      }).length;
    }

    return {
      total: allPermitsForStats.length,
      expired: expiredCount,
      last48h: last48hCount,
      approved: approvedCount,
      rejected: rejectedCount,
      selectedDateCount,
    };
  }, [allPermitsForStats, selectedDate]);

  // Export to CSV
  const handleExportCSV = () => {
    if (permits.length === 0) {
      toast.error('No permits to export.');
      return;
    }

    const headers = [
      'Permit Number',
      'Registration Number',
      'Boat Name',
      'Owner Name',
      'Harbour Port',
      'Crew Count',
      'Status',
      'Permit Date',
      'Expiry Date',
      'Submitted Time',
      'Approved Time',
      'Rejection Reason',
    ];

    const rows = permits.map((p) => [
      p.permitNumber || `TN-FP-2026-${p.id}`,
      p.registrationNumber,
      `"${p.boatName || ''}"`,
      `"${p.ownerName || ''}"`,
      p.port || '',
      p.crewCount || 1,
      p.status,
      p.permitDate || '',
      p.expiryDate || '',
      `"${p.submittedTime || ''}"`,
      `"${p.approvedTime || ''}"`,
      `"${p.rejectionReason || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Permit_History_${selectedDate ? selectedDate : filterMode}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Permit history exported to CSV.');
  };

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

  const columns: Column<Permit>[] = [
    {
      header: 'Permit Details',
      accessor: (row) => (
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded border border-slate-300 inline-block">
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
      header: 'Vessel & Registration',
      accessor: (row) => (
        <div>
          <div className="flex items-center gap-1.5">
            <Ship className="w-3.5 h-3.5 text-tnmaritime-600" />
            <span className="font-mono text-xs font-bold text-slate-900">{row.registrationNumber}</span>
          </div>
          <span className="text-xs font-medium text-slate-600 block pl-5">{row.boatName}</span>
        </div>
      ),
    },
    {
      header: 'Owner & Crew',
      accessor: (row) => (
        <div>
          <span className="font-semibold text-xs text-slate-900 block">{row.ownerName}</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5">
            <Users className="w-3 h-3 text-slate-400" />
            {row.crewCount} crew aboard
          </span>
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
      header: 'Permit Date',
      accessor: (row) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800 block">
            {row.permitDate ? formatDateOnly(row.permitDate) : 'N/A'}
          </span>
          <span className="text-[11px] text-slate-500">
            {row.approvedTime ? `Approved: ${row.approvedTime}` : 'No Approval Stamp'}
          </span>
        </div>
      ),
    },
    {
      header: 'Expiry & Expiration Status',
      accessor: (row) => {
        const isExp48 = isExpiredInLast48Hours(row);
        const expiredAgo = formatExpiredTimeAgo(row.expiryDate);

        return (
          <div className="text-xs space-y-1">
            <span className="font-medium text-slate-800 block">
              {row.expiryDate ? formatDateTime(row.expiryDate) : 'No Expiry Recorded'}
            </span>
            {row.status === 'EXPIRED' && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  <AlertTriangle className="w-2.5 h-2.5" />
                  Expired {expiredAgo}
                </span>
                {isExp48 && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                    ⚡ Last 48h
                  </span>
                )}
              </div>
            )}
          </div>
        );
      },
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
          className="h-8 px-2.5 text-xs hover:border-tnmaritime-600 hover:text-tnmaritime-700"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Main Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-tnmaritime-50 border border-tnmaritime-200 text-tnmaritime-700">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                Permit History & Audit Log
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official chronological repository of expired, active, and past voyage permits.
                {activeHarbour && (
                  <span className="ml-1 font-semibold text-slate-700">
                    • Port: <span className="text-tnmaritime-700 font-bold">{activeHarbour}</span>
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls */}
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
              fetchPermits();
              fetchStatsOverview();
            }}
            className="h-9 px-3"
            title="Refresh Permit Records"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-tnmaritime-600' : ''}`} />
          </Button>
        </div>
      </div>

      {/* KPI Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Card 1: Last 48h Expired */}
        <div
          onClick={() => {
            setSelectedDate('');
            setFilterMode('48_HOURS_EXPIRED');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterMode === '48_HOURS_EXPIRED' && !selectedDate
              ? 'bg-amber-500/10 border-amber-500/40 shadow-sm ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Last 48 Hours Expired
            </span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.last48h}</span>
            <span className="text-[11px] font-medium text-amber-700">Immediate Review</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Permits expired in the recent 48-hour cycle</p>
        </div>

        {/* Card 2: Full Permit Archive */}
        <div
          onClick={() => {
            setSelectedDate('');
            setFilterMode('ALL_HISTORY');
          }}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            filterMode === 'ALL_HISTORY' && !selectedDate
              ? 'bg-tnnavy-500/10 border-tnnavy-500/40 shadow-sm ring-2 ring-tnnavy-400/30'
              : 'bg-white border-slate-200 hover:border-tnnavy-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-tnnavy-900">
              Full Archive
            </span>
            <span className="p-1.5 rounded-lg bg-tnnavy-100 text-tnnavy-800">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.total}</span>
            <span className="text-[11px] font-medium text-tnnavy-700">Total Records</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Complete departmental audit trail</p>
        </div>
      </div>

      {/* Top Filter Controls Section */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            <button
              onClick={() => {
                setSelectedDate('');
                setFilterMode('48_HOURS_EXPIRED');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                filterMode === '48_HOURS_EXPIRED' && !selectedDate
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-300'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Last 48h Expired
            </button>

            <button
              onClick={() => {
                setSelectedDate('');
                setFilterMode('ALL_HISTORY');
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                filterMode === 'ALL_HISTORY' && !selectedDate
                  ? 'bg-tnnavy-900 text-white shadow-sm ring-2 ring-tnnavy-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              All History
            </button>
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

        {/* Calendar Date Picker Bar */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 transition-colors">
              <Calendar className="w-4 h-4 text-tnmaritime-600 shrink-0" />
              <label htmlFor="calendar-date-input" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                Select Date:
              </label>
              <input
                id="calendar-date-input"
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
                    ? 'bg-tnmaritime-600 text-white border-tnmaritime-600 font-bold shadow-xs'
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
                    ? 'bg-tnmaritime-600 text-white border-tnmaritime-600 font-bold shadow-xs'
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

          {/* Port / Harbour Selector (if apex officer or selectable) */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">Port Filter:</span>
            {isApexOfficer ? (
              <select
                value={selectedHarbour}
                onChange={(e) => setSelectedHarbour(e.target.value)}
                className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-slate-800 outline-none focus:ring-2 focus:ring-tnmaritime-500"
              >
                <option value="">All Harbours (Apex View)</option>
                {ALL_HARBOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {activeHarbour || 'Coastal Station'}
              </span>
            )}
          </div>
        </div>

        {/* Active Filter Indicators */}
        {selectedDate && (
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-between text-xs text-sky-900">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>
                Showing <strong>Full History</strong> for particular date: <strong>{formatDateOnly(selectedDate)}</strong> ({selectedDate}).
                Includes all statuses (Expired, Approved, Rejected).
              </span>
            </div>
            <button
              onClick={handleClearDate}
              className="p-1 rounded-md hover:bg-sky-200 text-sky-700 transition-colors"
              title="Return to standard filter mode"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 48h Notice banner when no records in the immediate 48h window */}
      {filterMode === '48_HOURS_EXPIRED' && permits.length === 0 && !isLoading && !selectedDate && (
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 gap-3">
          <div className="flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Zero permits expired within the strict last 48-hour window. You can view all records in the full history archive.
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedDate('');
              setFilterMode('ALL_HISTORY');
            }}
            className="h-8 px-3 text-xs bg-white border-amber-300 text-amber-900 hover:bg-amber-100 shrink-0 font-semibold"
          >
            View Full History
          </Button>
        </div>
      )}

      {/* Main Data Table */}
      <DataTable
        columns={columns}
        data={permits}
        isLoading={isLoading}
        emptyTitle={
          selectedDate
            ? `No Permits Found for ${formatDateOnly(selectedDate)}`
            : filterMode === '48_HOURS_EXPIRED'
            ? 'No Expired Permits in the Last 48 Hours'
            : 'No Historical Permits Found'
        }
        emptyDescription={
          selectedDate
            ? `No voyages or permit activities were registered on ${selectedDate}. You can select another date or clear the date filter.`
            : filterMode === '48_HOURS_EXPIRED'
            ? 'No permits have expired in the past 48 hours relative to the current clock. You can select "All Expired" or "All History" to view previous records.'
            : 'No historical permit records matched your filter criteria.'
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
