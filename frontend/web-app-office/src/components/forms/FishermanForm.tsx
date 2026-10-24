import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { fishermanSchema, FishermanFormValues } from '../../utils/validators';
import { TN_HARBOUR_MAPPING, getHarboursByDistrict } from '../../utils/constants';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Fisherman } from '../../types';

interface FishermanFormProps {
  initialData?: Fisherman | null;
  onSubmit: (values: FishermanFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const FishermanForm: React.FC<FishermanFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FishermanFormValues>({
    resolver: zodResolver(fishermanSchema),
    defaultValues: {
      fishermanId: initialData?.fishermanId || '',
      name: initialData?.name || '',
      phoneNumber: initialData?.phoneNumber || '',
      district: initialData?.district || 'Ramanathapuram',
      port: initialData?.port || 'Rameswaram',
      village: initialData?.village || '',
      address: initialData?.address || '',
      photo: initialData?.photo || '',
      status: initialData?.status || 'ACTIVE',
    },
  });

  const selectedDistrict = watch('district');
  const availableHarbours = getHarboursByDistrict(selectedDistrict);

  useEffect(() => {
    if (availableHarbours.length > 0) {
      const currentPort = watch('port');
      if (!availableHarbours.includes(currentPort)) {
        setValue('port', availableHarbours[0]);
      }
    }
  }, [selectedDistrict, availableHarbours, setValue, watch]);

  const districtOptions = TN_HARBOUR_MAPPING.map(d => ({
    value: d.district,
    label: d.district,
  }));

  const harbourOptions = availableHarbours.map(h => ({
    value: h,
    label: h,
  }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Fisherman ID (Biometric / Govt ID)"
          placeholder="e.g. FSH-TN-RMS-001"
          required
          disabled={!!initialData}
          {...register('fishermanId', {
            onChange: (e) => {
              e.target.value = e.target.value.toUpperCase();
            },
          })}
          error={errors.fishermanId?.message}
          helperText={initialData ? 'Fisherman ID cannot be modified' : 'Must be unique in state registry'}
        />

        <Input
          label="Full Name"
          placeholder="e.g. M. Senthil Kumar"
          required
          {...register('name')}
          error={errors.name?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone Number"
          placeholder="e.g. 9842145678"
          required
          maxLength={10}
          {...register('phoneNumber')}
          error={errors.phoneNumber?.message}
        />

        <Select
          label="District"
          required
          options={districtOptions}
          {...register('district')}
          error={errors.district?.message}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Harbour / Station"
          required
          options={harbourOptions}
          {...register('port')}
          error={errors.port?.message}
        />

        <Select
          label="Registry Status"
          options={[
            { value: 'ACTIVE', label: 'ACTIVE' },
            { value: 'INACTIVE', label: 'INACTIVE' },
            { value: 'BLOCKED', label: 'BLOCKED' },
          ]}
          {...register('status')}
          error={errors.status?.message}
        />
      </div>

      <div>
        <Input
          label="Residential Address"
          placeholder="e.g. Door No. 12/4, Main Sea Road, Rameswaram"
          {...register('address')}
          error={errors.address?.message}
        />
      </div>

      <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
        <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button variant="primary" size="sm" type="submit" isLoading={isLoading}>
          {initialData ? 'Update Fisherman Profile' : 'Register Fisherman'}
        </Button>
      </div>
    </form>
  );
};
