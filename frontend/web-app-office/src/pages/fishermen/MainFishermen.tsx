import React, { useState, useEffect } from 'react';
import { fishermanService } from '../../services/fisherman';
import { Fisherman } from '../../types';
import { DataTable, Column } from '../../components/tables/DataTable';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { FishermanForm } from '../../components/forms/FishermanForm';
import { ConfirmationDialog } from '../../components/dialogs/ConfirmationDialog';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPhoneNumber } from '../../utils/formatters';
import { ALL_HARBOURS } from '../../utils/constants';
import toast from 'react-hot-toast';
import { Users, Plus, Search, Edit2, Trash2, Eye, RefreshCw } from 'lucide-react';

export const MainFishermen: React.FC = () => {
  const [fishermen, setFishermen] = useState<Fisherman[]>([]);
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
  const [editingFisherman, setEditingFisherman] = useState<Fisherman | null>(null);
  const [viewingFisherman, setViewingFisherman] = useState<Fisherman | null>(null);
  const [deletingFisherman, setDeletingFisherman] = useState<Fisherman | null>(null);
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);

  const fetchFishermen = async () => {
    setIsLoading(true);
    try {
      const response = await fishermanService.getFishermen({
        harbour: selectedHarbour || undefined,
        search: debouncedSearch,
        page: currentPage,
        size: pageSize,
      });
      setFishermen(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (err: any) {
      toast.error('Failed to load statewide fisherman database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearch, selectedHarbour]);

  useEffect(() => {
    fetchFishermen();
  }, [debouncedSearch, selectedHarbour, currentPage, pageSize]);

  const handleCreateSubmit = async (values: any) => {
    setIsFormSubmitting(true);
    try {
      await fishermanService.createFisherman(values);
      toast.success(`Fisherman ${values.name} (${values.fishermanId}) registered successfully!`);
      setIsAddModalOpen(false);
      fetchFishermen();
    } catch (err: any) {
      toast.error(err.message || 'Failed to register fisherman.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleEditSubmit = async (values: any) => {
    if (!editingFisherman) return;
    setIsFormSubmitting(true);
    try {
      await fishermanService.updateFisherman(editingFisherman.fishermanId, values);
      toast.success(`Fisherman ${editingFisherman.fishermanId} updated successfully!`);
      setEditingFisherman(null);
      fetchFishermen();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update fisherman.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFisherman) return;
    setIsFormSubmitting(true);
    try {
      await fishermanService.deleteFisherman(deletingFisherman.fishermanId);
      toast.success(`Fisherman ${deletingFisherman.fishermanId} deleted from registry.`);
      setDeletingFisherman(null);
      fetchFishermen();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete fisherman.');
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const columns: Column<Fisherman>[] = [
    {
      header: 'Fisherman ID',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-tnnavy-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
          {row.fishermanId}
        </span>
      ),
    },
    {
      header: 'Name',
      accessor: (row) => (
        <span className="font-semibold text-slate-900 text-xs">{row.name}</span>
      ),
    },
    {
      header: 'Phone Number',
      accessor: (row) => (
        <span className="text-xs font-mono text-slate-600">{formatPhoneNumber(row.phoneNumber)}</span>
      ),
    },
    {
      header: 'Harbour Station',
      accessor: (row) => (
        <span className="text-xs font-semibold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
          {row.port}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.isBlocked ? 'danger' : 'success'} size="sm">
          {row.isBlocked ? 'BLOCKED' : 'ACTIVE'}
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
              setViewingFisherman(row);
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
              setEditingFisherman(row);
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
              setDeletingFisherman(row);
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
              Statewide Fishermen Registry
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
              {totalElements} Fishermen Registered
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Directorate Master Management: Biometric registration, port assignments, and crew master directory.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-md"
        >
          Add Fisherman
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Search by ID, name, phone, or village..."
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
          onClick={fetchFishermen}
          className="h-10 px-3 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={fishermen}
        isLoading={isLoading}
        emptyTitle="No Fishermen Records Found"
        emptyDescription="No registered fishermen match your current query."
        pagination={{
          currentPage,
          totalPages,
          totalElements,
          pageSize,
          onPageChange: setCurrentPage,
          onPageSizeChange: setPageSize,
        }}
        onRowClick={(row) => setViewingFisherman(row)}
      />

      {/* Add Fisherman Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Fisherman"
        subtitle="Tamil Nadu Biometric & Govt ID Crew Registry"
        maxWidth="lg"
      >
        <FishermanForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          isLoading={isFormSubmitting}
        />
      </Modal>

      {/* Edit Fisherman Modal */}
      {editingFisherman && (
        <Modal
          isOpen={!!editingFisherman}
          onClose={() => setEditingFisherman(null)}
          title={`Edit Fisherman: ${editingFisherman.name}`}
          subtitle={`Govt ID: ${editingFisherman.fishermanId}`}
          maxWidth="lg"
        >
          <FishermanForm
            initialData={editingFisherman}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingFisherman(null)}
            isLoading={isFormSubmitting}
          />
        </Modal>
      )}

      {/* View Fisherman Modal */}
      {viewingFisherman && (
        <Modal
          isOpen={!!viewingFisherman}
          onClose={() => setViewingFisherman(null)}
          title={viewingFisherman.name}
          subtitle={`Govt ID: ${viewingFisherman.fishermanId}`}
          maxWidth="md"
          footer={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const toEdit = viewingFisherman;
                  setViewingFisherman(null);
                  setEditingFisherman(toEdit);
                }}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => setViewingFisherman(null)}>
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
                <span className="text-sm font-bold text-slate-800">{viewingFisherman.port}</span>
              </div>
              <Badge variant={viewingFisherman.isBlocked ? 'danger' : 'success'} size="md">
                {viewingFisherman.isBlocked ? 'BLOCKED' : 'ACTIVE'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPhoneNumber(viewingFisherman.phoneNumber)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">District:</span>
                <span className="font-medium text-slate-900">{viewingFisherman.district}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Permit Status:</span>
                <span className="font-semibold text-slate-900">
                  {viewingFisherman.permitStatus || 'NO_PERMIT'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Address:</span>
                <span className="font-medium text-slate-900">
                  {viewingFisherman.address || viewingFisherman.village || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingFisherman}
        onClose={() => setDeletingFisherman(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Fisherman Record"
        message={`Are you sure you want to remove fisherman '${deletingFisherman?.name}' (${deletingFisherman?.fishermanId}) from the state database? This cannot be undone.`}
        confirmText="Confirm & Delete"
        variant="danger"
        isLoading={isFormSubmitting}
      />
    </div>
  );
};
