import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldAlert } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { blockReasonSchema, BlockReasonFormValues } from '../../utils/validators';
import { Fisherman } from '../../types';

interface BlockReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  fisherman?: Fisherman | null;
  isLoading?: boolean;
}

const COMMON_BLOCK_REASONS = [
  'Repeated unauthorized crossing of maritime boundary line.',
  'Operating fishing vessel without active departure token.',
  'Submitting falsified crew biometric identification.',
  'Possession of banned fishing nets / prohibited marine gear.',
  'Suspension requested by Coastal Security Group / Indian Coast Guard.',
];

export const BlockReasonModal: React.FC<BlockReasonModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  fisherman,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<BlockReasonFormValues>({
    resolver: zodResolver(blockReasonSchema),
    defaultValues: {
      reason: '',
    },
  });

  const reasonValue = watch('reason') || '';

  const onSubmit = (data: BlockReasonFormValues) => {
    onConfirm(data.reason);
    reset();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!fisherman) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Block Fisherman Record"
      subtitle={`Fisherman: ${fisherman.name} (${fisherman.fishermanId})`}
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
            leftIcon={<ShieldAlert className="w-4 h-4" />}
          >
            Confirm & Block
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="p-3.5 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700">
          <p className="font-semibold mb-1">Warning: Maritime Permit Blacklist</p>
          Blocking this fisherman will immediately prevent them from participating in permit crew manifests and applying for departure tokens across all coastal stations.
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1.5">
            Quick Select Reason:
          </label>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_BLOCK_REASONS.map((r, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setValue('reason', r, { shouldValidate: true })}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors text-left"
              >
                {r.length > 42 ? r.slice(0, 42) + '...' : r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
            Reason for Blocking <span className="text-rose-500">*</span>
          </label>
          <textarea
            {...register('reason')}
            rows={3}
            placeholder="Explain the security violation, regulatory infraction, or Coastal Guard notice..."
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400"
          />
          <div className="flex justify-between items-center mt-1">
            {errors.reason ? (
              <span className="text-xs text-rose-600 font-medium">{errors.reason.message}</span>
            ) : (
              <span className="text-xs text-slate-400">Minimum 5 characters</span>
            )}
            <span className="text-xs text-slate-400">{reasonValue.length}/500</span>
          </div>
        </div>
      </form>
    </Modal>
  );
};
