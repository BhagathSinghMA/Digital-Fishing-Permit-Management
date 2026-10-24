import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertOctagon } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { rejectReasonSchema, RejectReasonFormValues } from '../../utils/validators';
import { Permit } from '../../types';

interface RejectReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  permit?: Permit | null;
  isLoading?: boolean;
}

const COMMON_REASONS = [
  'Adverse weather and rough sea advisory issued by IMD.',
  'Crew manifest contains unverified biometric records.',
  'VHF marine radio / GPS transponder communication failure.',
  'Exceeded registered boat carrying passenger / crew capacity.',
  'Missing required life jackets and marine safety distress flares.',
];

export const RejectReasonModal: React.FC<RejectReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  permit,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<RejectReasonFormValues>({
    resolver: zodResolver(rejectReasonSchema),
    defaultValues: {
      reason: '',
    },
  });

  const reasonValue = watch('reason') || '';

  const onSubmit = (data: RejectReasonFormValues) => {
    onConfirm(data.reason);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!permit) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Fishing Permit Request"
      subtitle={`Vessel: ${permit.boatName} (${permit.registrationNumber})`}
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
            leftIcon={<AlertOctagon className="w-4 h-4" />}
          >
            Confirm Rejection
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700">
          This rejection notice and explanation will be transmitted back to the boat owner on their mobile application.
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
            Quick Select Common Reason:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_REASONS.map((r, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setValue('reason', r, { shouldValidate: true })}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors text-left"
              >
                {r.length > 40 ? r.slice(0, 40) + '...' : r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
            Mandatory Rejection Rationale <span className="text-rose-500">*</span>
          </label>
          <textarea
            {...register('reason')}
            rows={4}
            placeholder="Specify reason for refusal (e.g. invalid safety equipment, inclement weather, expired crew pass)..."
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.reason ? (
              <span className="text-xs text-rose-600 font-medium">{errors.reason.message}</span>
            ) : (
              <span className="text-xs text-slate-400">Minimum 5 characters required</span>
            )}
            <span className="text-xs text-slate-400">{reasonValue.length}/500</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
