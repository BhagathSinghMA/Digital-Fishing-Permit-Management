import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fishermanService } from '../../services/fisherman';
import { Fisherman } from '../../types';
import { FishermanResultCard } from '../../components/cards/FishermanResultCard';
import { BlockReasonModal } from '../../components/dialogs/BlockReasonModal';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatPhoneNumber } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';
import {
  Search,
  Users,
  ShieldAlert,
  Loader2,
  AlertCircle,
  Phone,
  MapPin,
  Anchor,
  FileText,
  UserCheck,
} from 'lucide-react';

export const FishermanSearch: React.FC = () => {
  const { user } = useAuth();
  const harbour = user?.assignedHarbour || 'Rameswaram';

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<Fisherman[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Modals state
  const [selectedFisherman, setSelectedFisherman] = useState<Fisherman | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery || searchQuery.trim().length < 2) {
      toast.error('Please enter at least 2 characters to search.');
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      // Passes query and restricts to officer harbour
      const data = await fishermanService.searchFisherman(searchQuery.trim(), harbour);
      setResults(data);
    } catch (err: any) {
      toast.error('Search query failed.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleBlockConfirm = async (reason: string) => {
    if (!selectedFisherman) return;
    setIsActionLoading(true);
    try {
      const updated = await fishermanService.blockFisherman(selectedFisherman.fishermanId, reason);
      toast.success(`Fisherman ${updated.name} has been blocked.`);
      setIsBlockModalOpen(false);
      // Update local state
      setResults((prev) =>
        prev.map((f) => (f.fishermanId === updated.fishermanId ? updated : f))
      );
      if (selectedFisherman.fishermanId === updated.fishermanId) {
        setSelectedFisherman(updated);
      }
    } catch (err: any) {
      toast.error(err.message || 'Blocking action failed.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleUnblock = async (fisherman: Fisherman) => {
    try {
      const updated = await fishermanService.unblockFisherman(fisherman.fishermanId);
      toast.success(`Fisherman ${updated.name} unblocked.`);
      setResults((prev) =>
        prev.map((f) => (f.fishermanId === updated.fishermanId ? updated : f))
      );
    } catch (err: any) {
      toast.error('Failed to unblock fisherman.');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Zero Pre-load Centered Search Box Section */}
      <div className="text-center space-y-4 pt-4 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-bold text-amber-800">
          <Users className="w-3.5 h-3.5" />
          <span>ZERO-PRELOAD SEARCH PORTAL</span>
        </div>

        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Search Fisherman Records
        </h2>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Query biometrically verified fishermen in <span className="font-bold text-slate-800">{harbour}</span> strictly by Fisherman ID.
        </p>

        {/* Centered Search Bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-2xl mx-auto mt-6 flex flex-col sm:flex-row items-center gap-3 p-2 bg-white rounded-2xl border border-slate-300 shadow-gov-md"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Fisherman ID (e.g. FSH-TN-RMS-001)..."
              className="w-full bg-transparent pl-12 pr-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-mono"
              autoFocus
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSearching}
            className="w-full sm:w-auto px-6 py-3 shrink-0 rounded-xl font-bold shadow-md"
          >
            Search Registry
          </Button>
        </form>

        {/* Quick query hints */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 pt-1">
          <span className="font-semibold text-slate-400">Quick ID queries:</span>
          {['FSH-TN-RMS-001', 'FSH-TN-RMS-002', 'FSH-TN-CHE-001', 'FSH-TN-CHE-002'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => {
                setSearchQuery(q);
              }}
              className="px-2.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-mono transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section - Appears ONLY after searching */}
      {hasSearched && (
        <div className="space-y-4 pt-4 border-t border-slate-200 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900">
              Search Results ({results.length})
            </h3>
            <span className="text-xs text-slate-500">
              Query: <span className="font-mono font-semibold text-slate-800">"{searchQuery}"</span> in {harbour}
            </span>
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300">
              <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-800">No Fisherman Found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                No fisherman matching "{searchQuery}" is registered under {harbour} harbour.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((fisherman) => (
                <FishermanResultCard
                  key={fisherman.fishermanId}
                  fisherman={fisherman}
                  onView={(f) => {
                    setSelectedFisherman(f);
                    setIsDetailModalOpen(true);
                  }}
                  onBlock={(f) => {
                    setSelectedFisherman(f);
                    setIsBlockModalOpen(true);
                  }}
                  onUnblock={handleUnblock}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Full Profile Modal */}
      {selectedFisherman && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={selectedFisherman.name}
          subtitle={`Govt ID: ${selectedFisherman.fishermanId}`}
          maxWidth="md"
          footer={
            <Button variant="outline" size="sm" onClick={() => setIsDetailModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Station Assigned
                </span>
                <span className="text-sm font-bold text-slate-800">{selectedFisherman.port}</span>
              </div>
              <Badge
                variant={selectedFisherman.isBlocked ? 'danger' : 'success'}
                size="md"
              >
                {selectedFisherman.isBlocked ? 'BLOCKED' : 'ACTIVE'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white p-4 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Phone Number:</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatPhoneNumber(selectedFisherman.phoneNumber)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">District:</span>
                <span className="font-medium text-slate-900">{selectedFisherman.district}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Residential Address / Hamlet:</span>
                <span className="font-medium text-slate-900">
                  {selectedFisherman.address || selectedFisherman.village || 'Tamil Nadu Coastal Belt'}
                </span>
              </div>
            </div>

            {selectedFisherman.isBlocked && selectedFisherman.blockReason && (
              <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800">
                <span className="font-bold block">Blacklist / Suspension Rationale:</span>
                <p className="mt-1">{selectedFisherman.blockReason}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Block Fisherman Dialog */}
      <BlockReasonModal
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        onConfirm={handleBlockConfirm}
        fisherman={selectedFisherman}
        isLoading={isActionLoading}
      />
    </div>
  );
};
