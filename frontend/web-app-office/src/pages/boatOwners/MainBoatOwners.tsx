import React, { useState, useEffect } from 'react';
import { boatOwnerService } from '../../services/boatOwner';
import { BoatOwner } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Modal } from '../../components/common/Modal';
import { BoatOwnerForm } from '../../components/forms/BoatOwnerForm';
import { ConfirmationDialog } from '../../components/dialogs/ConfirmationDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPhoneNumber } from '../../utils/formatters';
import { ALL_HARBOURS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Ship, Plus, Search, Edit2, Trash2, Eye, RefreshCw, Filter } from 'lucide-react';

export const MainBoatOwners: React.FC = () => {
  const [boatOwners, setBoatOwners] = useState<BoatOwner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHarbour, setSelectedHarbour] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const debouncedSearch = useDebounce(searchTerm, 400);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<BoatOwner | null>(null);
  const [viewingOwner, setViewingOwner] = useState<BoatOwner | null>(null);
  const [deletingOwner, setDeletingOwner] = useState<BoatOwner | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const fetchBoatOwners = async () => {
    setIsLoading(true);
    try {
      const response = await boatOwnerService.getBoatOwners({
        harbour: selectedHarbour || undefined,
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
      });
      setBoatOwners(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load statewide boat owner master database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedHarbour]);

  useEffect(() => {
    fetchBoatOwners();
  }, [debouncedSearch, selectedHarbour, currentPage, pageSize]);

  const handleCreateSubmit = async (values: any) => {
    setIsFormSubmitting(true);
    try {
      await boatOwnerService.createBoatOwner(values);
      toast.success(`Boat ${values.boatName} (${values.registrationNumber}) registered successfully!`);
      setIsAddModalOpen(false);
      fetchBoatOwners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register boat owner.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingOwner) return;
    setIsFormSubmitting(true);
    try {
      await boatOwnerService.updateBoatOwner(editingOwner.registrationNumber, values);
      toast.success(`Boat record ${editingOwner.registrationNumber} updated successfully!`);
      setEditingOwner(null);
      fetchBoatOwners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update boat owner.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOwner) return;
    setIsFormSubmitting(true);
    try {
      await boatOwnerService.deleteBoatOwner(deletingOwner.registrationNumber);
      toast.success(`Boat record ${deletingOwner.registrationNumber} deleted.`);
      setDeletingOwner(null);
      fetchBoatOwners();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete boat owner.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

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
      accessor: (row) => <span className="font-semibold text-slate-900 text-xs">{row.boatName}</span>,
    },
    {
      header: 'Owner Name',
      accessor: (row) => <span className="font-medium text-slate-800 text-xs">{row.ownerName}</span>,
    },
    {
      header: 'Phone Number',
      accessor: (row) => (
        <span className="text-xs font-mono text-slate-600">{formatPhoneNumber(row.phoneNumber)}</span>
      ),
    },
    {
      header: 'Harbour / Port',
      accessor: (row) => (
        <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          {row.port}
        </span>
      ),
    },
    {
      header: 'Fisherman ID',
      accessor: (row) => <span className="font-mono text-xs text-slate-600">{row.fishermanId}</span>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'BLOCKED' ? 'danger' : 'success'} size="sm">
          {row.status || 'ACTIVE'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setViewingOwner(row);
            }}
            className="p-1.5 h-8 text-slate-500 hover:text-slate-900"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setEditingOwner(row);
            }}
            className="p-1.5 h-8 text-blue-600 hover:bg-blue-50"
            title="Edit Record"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingOwner(row);
            }}
            className="p-1.5 h-8 text-rose-600 hover:bg-rose-50"
            title="Delete Record"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Statewide Boat Owner Master Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
              {totalElements} Registered Statewide
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directorate Master Management: Add, modify, or verify registered fishing vessels across all Tamil Nadu maritime zones.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md"
        >
          Add Boat Owner
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by registration, boat, owner, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="w-full sm:w-64">
            <select
              value={selectedHarbour}
              onChange={(e) => setSelectedHarbour(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-tnnavy-500"
            >
              <option value="">All Harbours (Statewide)</option>
              {ALL_HARBOURS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchBoatOwners}
          className="h-10 px-3 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={boatOwners}
        isLoading={isLoading}
        emptyTitle="No Boat Owners Found"
        emptyDescription="No registered boat owners match your current query."
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(row) => setViewingOwner(row)}
      />

      {/* Add Boat Owner Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Boat Owner"
        subtitle="Tamil Nadu Marine Fisheries Master Registry"
        maxWidth="lg"
      >
        <BoatOwnerForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isFormSubmitting}
        />
      </Modal>

      {/* Edit Boat Owner Modal */}
      {editingOwner && (
        <Modal
          isOpen={!!editingOwner}
          onClose={() => setEditingOwner(null)}
          title={`Edit Boat: ${editingOwner.boatName}`}
          subtitle={`Registration: ${editingOwner.registrationNumber}`}
          maxWidth="lg"
        >
          <BoatOwnerForm
            initialData={editingOwner}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingOwner(null)}
            isLoading={isFormSubmitting}
          />
        </Modal>
      )}

      {/* View Details Modal */}
      {viewingOwner && (
        <Modal
          isOpen={!!viewingOwner}
          onClose={() => setViewingOwner(null)}
          title={viewingOwner.boatName}
          subtitle={`Registration Number: ${viewingOwner.registrationNumber}`}
          maxWidth="md"
          footer={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const toEdit = viewingOwner;
                  setViewingOwner(null);
                  setEditingOwner(toEdit);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewingOwner(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Station Assigned
                </span>
                <span className="text-sm font-bold text-slate-800">{viewingOwner.port}</span>
              </div>
              <Badge variant={viewingOwner.status === 'BLOCKED' ? 'danger' : 'success'} size="md">
                {viewingOwner.status || 'ACTIVE'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Owner Name:</span>
                <span className="font-semibold text-slate-900">{viewingOwner.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPhoneNumber(viewingOwner.phoneNumber)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Fisherman ID:</span>
                <span className="font-mono font-semibold text-sky-800">{viewingOwner.fishermanId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">District / State:</span>
                <span className="font-medium text-slate-900">
                  {viewingOwner.district}, {viewingOwner.state || 'Tamil Nadu'}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingOwner}
        onClose={() => setDeletingOwner(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Boat Record"
        message={`Are you sure you want to remove vessel '${deletingOwner?.boatName}' (${deletingOwner?.registrationNumber}) from the master registry? This action cannot be undone.`}
        confirmText="Confirm & Delete"
        variant="danger"
        isLoading={isFormSubmitting}
      />
    </div>
  );
};
