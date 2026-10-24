import React from 'react';
import { ShieldCheck, Anchor, Users } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Permit } from '../../types';

interface ApproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  permit?: Permit | null;
  isLoading?: boolean;
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  permit,
  isLoading = false,
}) => {
  if (!permit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Fishing Departure Permit"
      subtitle="Officer Authorization & QR Token Generation"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
            leftIcon={<ShieldCheck className="w-4 h-4" />}
          >
            Authorize & Issue Token
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-2 text-emerald-800 font-semibold text-sm mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Ready for 24-Hour Departure Clearance</span>
          </div>
          <p className="text-xs text-emerald-700 leading-relaxed">
            Approving this request will generate an official Tamil Nadu digital maritime permit QR pass valid for 24 hours from issuance.
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-sm">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Vessel Reg No:</span>
            <span className="font-mono font-bold text-slate-800">{permit.registrationNumber}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Boat Name:</span>
            <span className="font-semibold text-slate-800">{permit.boatName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Boat Owner:</span>
            <span className="text-slate-800">{permit.ownerName}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Harbour Port:</span>
            <span className="font-medium text-slate-800">{permit.port}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-medium">Crew Size:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-tnnavy-700">
              <Users className="w-3.5 h-3.5" />
              {permit.crewCount} Biometric Verified
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-500 italic">
          Confirm that weather radar and biometric manifest compliance checks have been performed.
        </p>
      </div>
    </Modal>
  );
};
