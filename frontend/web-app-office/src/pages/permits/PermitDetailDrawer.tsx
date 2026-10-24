import React, { useState, useEffect } from 'react';
import { Drawer } from '../../components/common/Drawer';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { QRViewer } from '../../components/common/QRViewer';
import { permitService } from '../../services/permit';
import { Permit } from '../../types';
import { formatDateTime, calculateTimeRemaining, formatPhoneNumber } from '../../utils/formatters';
import {
  Ship,
  Users,
  Clock,
  CheckCircle2,
  AlertOctagon,
  FileText,
  Phone,
  MapPin,
  ShieldCheck,
  Printer,
  Calendar,
  Loader2,
  UserCheck,
} from 'lucide-react';

interface PermitDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  permit?: Permit | null;
  onApprove?: () => void;
  onReject?: () => void;
}

export const PermitDetailDrawer: React.FC<PermitDetailDrawerProps> = ({
  isOpen,
  onClose,
  permit,
  onApprove,
  onReject,
}) => {
  const [detailedPermit, setDetailedPermit] = useState<Permit | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  useEffect(() => {
    if (isOpen && permit?.id) {
      setIsLoadingDetails(true);
      permitService
        .getPermitDetails(permit.id)
        .then((data) => {
          setDetailedPermit(data);
        })
        .catch((err) => {
          console.error('Failed to load full permit details:', err);
          setDetailedPermit(null);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    } else {
      setDetailedPermit(null);
    }
  }, [isOpen, permit?.id]);

  if (!permit) return null;

  const currentPermit = detailedPermit || permit;
  const isPending = currentPermit.status === 'PENDING';
  const isApproved = currentPermit.status === 'APPROVED' || currentPermit.status === 'ACTIVE';
  const isRejected = currentPermit.status === 'REJECTED';

  const timeRemaining = isApproved ? calculateTimeRemaining(currentPermit.expiryDate) : null;
  const crewList = currentPermit.crewMembers || [];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={currentPermit.boatName}
      subtitle={`Registration: ${currentPermit.registrationNumber} • Station: ${currentPermit.port}`}
      width="lg"
      footer={
        <div className="w-full flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>

          <div className="flex items-center gap-2">
            {isPending && (
              <>
                {onReject && (
                  <Button variant="danger" size="sm" onClick={onReject} leftIcon={<AlertOctagon className="w-4 h-4" />}>
                    Reject
                  </Button>
                )}
                {onApprove && (
                  <Button variant="success" size="sm" onClick={onApprove} leftIcon={<ShieldCheck className="w-4 h-4" />}>
                    Approve Permit
                  </Button>
                )}
              </>
            )}

            {isApproved && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                leftIcon={<Printer className="w-4 h-4" />}
              >
                Print Certificate
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Status Header Banner */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Official Permit Reference
            </span>
            <span className="font-mono text-sm font-extrabold text-tnnavy-900">
              {currentPermit.permitNumber || `TN-FP-2026-${String(currentPermit.id).padStart(6, '0')}`}
            </span>
          </div>
          <Badge status={currentPermit.status} size="lg" />
        </div>

        {/* Rejection Notice if Rejected */}
        {isRejected && currentPermit.rejectionReason && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-900">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Officer Rejection Reason:</span>
            </div>
            <p className="pl-5 leading-relaxed">{currentPermit.rejectionReason}</p>
          </div>
        )}

        {/* Expiry Banner if Approved */}
        {isApproved && timeRemaining && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-semibold ${
              timeRemaining.isExpired
                ? 'bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Validity Countdown:</span>
            </div>
            <span className="font-bold">{timeRemaining.text}</span>
          </div>
        )}

        {/* QR Pass Preview if Approved */}
        {isApproved && (
          <QRViewer
            tokenValue={currentPermit.qrToken || `QR-TN-${currentPermit.registrationNumber}-${currentPermit.id}`}
            permitNumber={currentPermit.permitNumber || `TN-FP-2026-${String(currentPermit.id).padStart(6, '0')}`}
            boatName={currentPermit.boatName}
            ownerName={currentPermit.ownerName}
            port={currentPermit.port}
            expiryDate={currentPermit.expiryDate}
          />
        )}

        {/* Vessel & Owner Information Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <Ship className="w-4 h-4 text-tnnavy-600" />
            <span>Vessel & Registered Owner</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div>
              <span className="text-slate-500 block">Registration Number</span>
              <span className="font-mono font-bold text-slate-900">{currentPermit.registrationNumber}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Boat Name</span>
              <span className="font-semibold text-slate-900">{currentPermit.boatName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Owner Name</span>
              <span className="font-medium text-slate-900">{currentPermit.ownerName}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Contact Number</span>
              <span className="font-medium text-slate-900">{formatPhoneNumber(currentPermit.ownerPhone)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Harbour / Port</span>
              <span className="font-medium text-slate-900">{currentPermit.port}</span>
            </div>
            <div>
              <span className="text-slate-500 block">District / State</span>
              <span className="font-medium text-slate-900">
                {currentPermit.district || 'Tamil Nadu'}, {currentPermit.state || 'Tamil Nadu'}
              </span>
            </div>
          </div>
        </div>

        {/* Crew Member Details Section */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3.5 shadow-xs">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase tracking-wider">
              <Users className="w-4 h-4 text-tnnavy-600" />
              <span>Crew Member Details</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded text-slate-700">
              {crewList.length || currentPermit.crewCount || 0} Members
            </span>
          </div>

          {isLoadingDetails ? (
            <div className="py-6 flex items-center justify-center gap-2 text-slate-500 text-xs">
              <Loader2 className="w-4 h-4 animate-spin text-tnnavy-600" />
              <span>Loading registered crew details...</span>
            </div>
          ) : crewList.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {crewList.map((crew, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-slate-900 text-sm">{crew.name}</span>
                    <span className="font-mono text-xs font-bold text-tnnavy-900 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                      {crew.fishermanId}
                    </span>
                  </div>

                  {crew.role && (
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                      {crew.role}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <UserCheck className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              <p>No individual crew records attached to this permit.</p>
            </div>
          )}
        </div>

        {/* Application Timeline Audit */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 pb-2.5 border-b border-slate-100 font-bold text-slate-800 text-xs uppercase tracking-wider">
            <Calendar className="w-4 h-4 text-tnnavy-600" />
            <span>Application Timeline</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Submitted at:</span>
              <span className="font-medium text-slate-800">{currentPermit.submittedTime}</span>
            </div>
            {currentPermit.approvedTime && (
              <div className="flex justify-between">
                <span className="text-slate-500">Approved at:</span>
                <span className="font-medium text-emerald-700">{currentPermit.approvedTime}</span>
              </div>
            )}
            {currentPermit.expiryDate && (
              <div className="flex justify-between">
                <span className="text-slate-500">Expires at:</span>
                <span className="font-medium text-slate-800">{formatDateTime(currentPermit.expiryDate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
};
