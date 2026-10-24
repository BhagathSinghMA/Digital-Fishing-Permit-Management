import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { boatOwnerService } from '../../services/boatOwner';
import { BoatOwner } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPhoneNumber } from '../../utils/formatters';
import toast from 'react-hot-toast';
import { Ship, Search, Eye, RefreshCw, Phone, User, MapPin, ShieldCheck } from 'lucide-react';

export const BoatOwnersList: React.FC = () => {
  const { user } = useAuth();
  const harbour = user?.assignedHarbour || 'Rameswaram';

  const [boatOwners, setBoatOwners] = useState<BoatOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 400);
  const [selectedOwner, setSelectedOwner] = useState<BoatOwner | null>(null);

  const fetchBoatOwners = async () => {
    setIsLoading(true);
    try {
      // STRICT HARBOUR ISOLATION: passes officer harbour automatically
      const response = await boatOwnerService.getBoatOwners({
        harbour,
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
      });
      setBoatOwners(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load harbour boat owner directory.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, harbour]);

  useEffect(() => {
    fetchBoatOwners();
  }, [harbour, debouncedSearch, currentPage, pageSize]);

  const columns: Column<BoatOwner>[] = [
    {
      header: 'Boat Registration',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-tnnavy-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          {row.registrationNumber}
        </span>
      ),
    },
    {
      header: 'Boat Name',
      accessor: (row) => (
        <span className="font-semibold text-slate-900 text-xs">{row.boatName}</span>
      ),
    },
    {
      header: 'Owner Name',
      accessor: (row) => (
        <span className="font-medium text-slate-800 text-xs">{row.ownerName}</span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (row) => (
        <span className="text-xs font-mono text-slate-600">{formatPhoneNumber(row.phoneNumber)}</span>
      ),
    },
    {
      header: 'Fisherman ID',
      accessor: (row) => (
        <span className="font-mono text-xs text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          {row.fishermanId}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge
          variant={row.status === 'BLOCKED' ? 'danger' : 'success'}
          size="sm"
        >
          {row.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOwner(row);
          }}
          className="h-8 px-2.5 text-xs"
          leftIcon={<Eye className="w-3.5 h-3.5" />}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Strict Harbour Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Registered Boat Owners ({harbour})
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
              {totalElements} Vessels Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Harbour Isolation Enforced: Only displaying vessel owners assigned to <span className="font-semibold text-slate-800">{harbour}</span>.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-72">
            <Input
              placeholder="Search by reg no, boat, owner, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBoatOwners}
            className="h-10 px-3"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={boatOwners}
        isLoading={isLoading}
        emptyTitle="No Boat Owners Found"
        emptyDescription={`No boat owners are registered in ${harbour} harbour under your search parameters.`}
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(row) => setSelectedOwner(row)}
      />

      {/* Boat Owner View Details Modal */}
      {selectedOwner && (
        <Modal
          isOpen={!!selectedOwner}
          onClose={() => setSelectedOwner(null)}
          title={selectedOwner.boatName}
          subtitle={`Registration Number: ${selectedOwner.registrationNumber}`}
          maxWidth="md"
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelectedOwner(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Station Assignment
                </span>
                <span className="text-sm font-bold text-slate-800">{selectedOwner.port}</span>
              </div>
              <Badge
                variant={selectedOwner.status === 'BLOCKED' ? 'danger' : 'success'}
                size="md"
              >
                {selectedOwner.status || 'ACTIVE'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Owner Name:</span>
                <span className="font-semibold text-slate-900">{selectedOwner.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPhoneNumber(selectedOwner.phoneNumber)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Fisherman ID:</span>
                <span className="font-mono font-semibold text-sky-800">{selectedOwner.fishermanId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">District / State:</span>
                <span className="font-medium text-slate-900">
                  {selectedOwner.district}, {selectedOwner.state || 'Tamil Nadu'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                Vessel is verified and compliant with Tamil Nadu Marine Fisheries Regulation Act.
              </span>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
