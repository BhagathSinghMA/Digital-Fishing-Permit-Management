import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { boatOwnerSchema, BoatOwnerFormValues } from '../../utils/validators';
import { TN_HARBOUR_MAPPING, getHarboursByDistrict } from '../../utils/constants';
import { fishermanService } from '../../services/fisherman';
import { useDebounce } from '../../hooks/useDebounce';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { BoatOwner, Fisherman } from '../../types';
import toast from 'react-hot-toast';
import {
  CheckCircle2,
  Search,
  Loader2,
  Sparkles,
  UserCheck,
  AlertCircle,
  X,
  ShieldAlert,
  ShieldCheck,
  Lock,
} from 'lucide-react';

interface BoatOwnerFormProps {
  initialData?: BoatOwner | null;
  onSubmit: (values: BoatOwnerFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const BoatOwnerForm: React.FC<BoatOwnerFormProps> = ({
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
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<BoatOwnerFormValues>({
    resolver: zodResolver(boatOwnerSchema),
    defaultValues: {
      registrationNumber: initialData?.registrationNumber || 'IND-TN',
      boatName: initialData?.boatName || '',
      ownerName: initialData?.ownerName || '',
      phoneNumber: initialData?.phoneNumber || '',
      fishermanId: initialData?.fishermanId || '',
      district: initialData?.district || 'Ramanathapuram',
      port: initialData?.port || 'Rameswaram',
      state: initialData?.state || 'Tamil Nadu',
      status: initialData?.status || 'ACTIVE',
    },
  });

  // Segmented Registration Number state: [Country=IND, State=TN, Port=CHE, Type=MM, Serial=000123]
  const parseRegNumber = (raw?: string) => {
    if (!raw) return { p1: 'IND', p2: 'TN', p3: '', p4: '', p5: '' };
    const clean = raw.trim().toUpperCase();
    const parts = clean.split(/[- ]+/);
    if (parts.length >= 5) {
      return {
        p1: parts[0] || 'IND',
        p2: parts[1] || 'TN',
        p3: parts[2] || '',
        p4: parts[3] || '',
        p5: parts.slice(4).join(''),
      };
    }
    if (parts.length === 4) {
      return {
        p1: parts[0] || 'IND',
        p2: parts[1] || 'TN',
        p3: parts[2] || '',
        p4: '',
        p5: parts[3] || '',
      };
    }
    return { p1: 'IND', p2: 'TN', p3: '', p4: '', p5: clean.replace(/^IND[- ]?/i, '') };
  };

  const [regParts, setRegParts] = useState(parseRegNumber(initialData?.registrationNumber));

  // Refs for auto-focusing across the 4 editable boxes
  const inputRef2 = React.useRef<HTMLInputElement>(null);
  const inputRef3 = React.useRef<HTMLInputElement>(null);
  const inputRef4 = React.useRef<HTMLInputElement>(null);
  const inputRef5 = React.useRef<HTMLInputElement>(null);

  // Sync initialData if it changes
  useEffect(() => {
    if (initialData?.registrationNumber) {
      setRegParts(parseRegNumber(initialData.registrationNumber));
    }
  }, [initialData]);

  // Sync regParts with form's registrationNumber (Format: IND-TN-CHE-MM-000123)
  const updateRegNumber = (newParts: { p1: string; p2: string; p3: string; p4: string; p5: string }) => {
    setRegParts(newParts);
    const p1 = (newParts.p1 || 'IND').trim().toUpperCase();
    const p2 = (newParts.p2 || '').trim().toUpperCase();
    const p3 = (newParts.p3 || '').trim().toUpperCase();
    const p4 = (newParts.p4 || '').trim().toUpperCase();
    const p5 = (newParts.p5 || '').trim().toUpperCase();

    const full = [p1, p2, p3, p4, p5].filter(Boolean).join('-');
    setValue('registrationNumber', full, { shouldValidate: true, shouldDirty: true });
  };

  const handleRegPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const parsed = parseRegNumber(pasted);
    updateRegNumber(parsed);
    inputRef5.current?.focus();
  };

  const fishermanIdValue = watch('fishermanId');
  const debouncedFishermanId = useDebounce(fishermanIdValue, 300);
  const [isSearchingFisherman, setIsSearchingFisherman] = useState(false);
  const [matchedFisherman, setMatchedFisherman] = useState<Fisherman | null>(null);
  const [notFoundId, setNotFoundId] = useState<string | null>(null);

  const handleClearFishermanId = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setValue('fishermanId', '', { shouldValidate: true, shouldDirty: true });
    if (!initialData) {
      setValue('ownerName', '', { shouldValidate: false, shouldDirty: true });
      setValue('phoneNumber', '', { shouldValidate: false, shouldDirty: true });
    }
    setMatchedFisherman(null);
    setNotFoundId(null);
    setIsSearchingFisherman(false);
  };

  // Auto-fill or clear owner details when Fisherman ID changes
  useEffect(() => {
    if (!debouncedFishermanId || debouncedFishermanId.trim().length < 3) {
      if (!initialData) {
        setValue('ownerName', '', { shouldValidate: false });
        setValue('phoneNumber', '', { shouldValidate: false });
      }
      setMatchedFisherman(null);
      setNotFoundId(null);
      setIsSearchingFisherman(false);
      return;
    }

    // Skip auto-fill if in edit mode and ID hasn't changed
    if (initialData && debouncedFishermanId.trim().toUpperCase() === initialData.fishermanId?.toUpperCase()) {
      return;
    }

    let isMounted = true;
    const lookupFisherman = async () => {
      setIsSearchingFisherman(true);
      setNotFoundId(null);
      try {
        const found = await fishermanService.getFishermanById(debouncedFishermanId.trim().toUpperCase());
        if (isMounted && found) {
          setMatchedFisherman(found);
          setNotFoundId(null);
          clearErrors('fishermanId');

          // Auto-fill owner name and phone number
          setValue('ownerName', found.name, { shouldValidate: true, shouldDirty: true });
          setValue('phoneNumber', found.phoneNumber, { shouldValidate: true, shouldDirty: true });

          // Optionally auto-fill district and port if matched
          if (found.district && TN_HARBOUR_MAPPING.some(d => d.district.toLowerCase() === found.district.toLowerCase())) {
            const matchedDistrict = TN_HARBOUR_MAPPING.find(d => d.district.toLowerCase() === found.district.toLowerCase())?.district;
            if (matchedDistrict) {
              setValue('district', matchedDistrict, { shouldValidate: true });
              if (found.port) {
                const harbours = getHarboursByDistrict(matchedDistrict);
                const matchedHarbour = harbours.find(h => h.toLowerCase() === found.port.toLowerCase() || found.port.toLowerCase().includes(h.toLowerCase()));
                if (matchedHarbour) {
                  setValue('port', matchedHarbour, { shouldValidate: true });
                }
              }
            }
          }
        }
      } catch {
        if (isMounted) {
          setMatchedFisherman(null);
          setNotFoundId(debouncedFishermanId.trim().toUpperCase());
          if (!initialData) {
            setValue('ownerName', '', { shouldValidate: false });
            setValue('phoneNumber', '', { shouldValidate: false });
          }
          if (debouncedFishermanId.trim().length >= 4) {
            setError('fishermanId', {
              type: 'manual',
              message: 'Fisherman ID not found in master database. Must be a registered fisherman to add a boat owner.',
            });
          }
        }
      } finally {
        if (isMounted) {
          setIsSearchingFisherman(false);
        }
      }
    };

    lookupFisherman();

    return () => {
      isMounted = false;
    };
  }, [debouncedFishermanId, setValue, initialData, setError, clearErrors]);

  const selectedDistrict = watch('district');
  const availableHarbours = getHarboursByDistrict(selectedDistrict);

  // When district changes, update port default to the first harbour in that district if needed
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

  const handleFormSubmit = (values: BoatOwnerFormValues) => {
    if (!initialData && !matchedFisherman) {
      toast.error(`Ineligible: Fisherman ID '${values.fishermanId}' does not exist in the database. A boat owner must be an existing registered fisherman.`);
      return;
    }
    onSubmit(values);
  };

  const isEligible = !!initialData || !!matchedFisherman;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      {/* Step 1: Fisherman Biometric ID Search & Eligibility Verification */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          matchedFisherman
            ? 'bg-emerald-50/60 border-emerald-300'
            : notFoundId
            ? 'bg-rose-50/70 border-rose-300'
            : 'bg-sky-50/70 border-sky-200'
        } space-y-2.5`}
      >
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-sky-700" />
            1. Fisherman Biometric ID <span className="text-rose-500">*</span>
          </label>

          {isSearchingFisherman && (
            <span className="text-[11px] font-medium text-sky-700 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-sky-600" />
              Verifying registry...
            </span>
          )}

          {matchedFisherman && !isSearchingFisherman && (
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified & Eligible
            </span>
          )}

          {notFoundId && !isSearchingFisherman && (
            <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-300 flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              Not Eligible
            </span>
          )}
        </div>

        <Input
          placeholder="e.g. FSH-TN-RMS-001 or FSH-TN-CHN-001"
          required
          {...register('fishermanId', {
            onChange: (e) => {
              const val = e.target.value.toUpperCase();
              e.target.value = val;
              if (val.trim() === '' && !initialData) {
                setValue('ownerName', '', { shouldValidate: false, shouldDirty: true });
                setValue('phoneNumber', '', { shouldValidate: false, shouldDirty: true });
                setMatchedFisherman(null);
                setNotFoundId(null);
                setIsSearchingFisherman(false);
              }
            },
          })}
          error={errors.fishermanId?.message}
          leftIcon={<Search className="w-4 h-4 text-slate-400" />}
          rightIcon={
            <div className="flex items-center gap-1.5">
              {isSearchingFisherman && (
                <Loader2 className="w-4 h-4 animate-spin text-sky-600" />
              )}
              {matchedFisherman && !isSearchingFisherman && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              {fishermanIdValue && (
                <button
                  type="button"
                  onClick={handleClearFishermanId}
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors"
                  title="Clear Fisherman ID"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          }
          helperText={
            !initialData && !matchedFisherman && !notFoundId
              ? 'Only registered fishermen are eligible to be added as boat owners.'
              : undefined
          }
        />

        {/* Verified Profile Card */}
        {matchedFisherman && (
          <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-xs flex items-center justify-between text-xs animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                {matchedFisherman.name.charAt(0)}
              </div>
              <div>
                <div className="font-bold text-slate-900 flex items-center gap-2">
                  <span>{matchedFisherman.name}</span>
                  <span className="font-mono text-emerald-700 font-medium">({matchedFisherman.phoneNumber})</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Harbour / District: <span className="font-semibold text-slate-700">{matchedFisherman.port || matchedFisherman.district}</span>
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
              Identity Confirmed
            </span>
          </div>
        )}

        {/* Ineligibility Warning Box */}
        {notFoundId && !isSearchingFisherman && (
          <div className="p-3 bg-rose-100/80 rounded-xl border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5 animate-in fade-in duration-200">
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-rose-950">
                Ineligible for Boat Registration
              </p>
              <p className="text-rose-800 text-[11px] mt-0.5 leading-relaxed">
                Fisherman ID <span className="font-mono font-bold">'{notFoundId}'</span> does not exist in the database. A boat owner <span className="font-semibold">must be a registered fisherman first</span> before registering a vessel.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Owner Details (Locked to Verified Fisherman Record) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="Owner Name"
            placeholder={isEligible ? "e.g. M. Senthil Kumar" : "Awaiting verified Fisherman ID..."}
            required
            readOnly={!initialData}
            {...register('ownerName')}
            error={errors.ownerName?.message}
            className={!initialData ? "bg-slate-50 text-slate-800 cursor-not-allowed" : ""}
            rightIcon={!initialData ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : undefined}
            helperText={
              !initialData
                ? matchedFisherman
                  ? 'Locked: Populated from verified fisherman record'
                  : 'Locked: Enter an existing Fisherman ID above'
                : undefined
            }
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            placeholder={isEligible ? "e.g. 9842145678" : "Awaiting verified Fisherman ID..."}
            required
            maxLength={10}
            readOnly={!initialData}
            {...register('phoneNumber')}
            error={errors.phoneNumber?.message}
            className={!initialData ? "bg-slate-50 text-slate-800 cursor-not-allowed font-mono" : "font-mono"}
            rightIcon={!initialData ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : undefined}
            helperText={
              !initialData
                ? matchedFisherman
                  ? 'Locked: Populated from verified fisherman record'
                  : 'Locked: Enter an existing Fisherman ID above'
                : undefined
            }
          />
        </div>
      </div>

      {/* Step 3: Vessel Details & Segmented Registration Number */}
      <div className="space-y-4">
        <div>
          <Input
            label="Boat Name"
            placeholder="e.g. Kadalarasi (கடலரசி)"
            required
            disabled={!isEligible}
            {...register('boatName')}
            error={errors.boatName?.message}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>
              Registration Number <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] text-slate-400 font-normal font-mono">
              Format: IND-TN-CHE-MM-000123
            </span>
          </label>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Box 1: IND (Fixed default, read-only) */}
            <div className="w-14 sm:w-16 shrink-0">
              <input
                type="text"
                value="IND"
                readOnly
                disabled
                tabIndex={-1}
                title="Country Code (Fixed: IND)"
                className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-slate-100 border border-slate-300 text-slate-700 rounded-lg py-2.5 px-1 cursor-not-allowed select-none shadow-xs"
              />
              <span className="block text-[10px] text-center text-slate-400 mt-1 font-medium">IND</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mb-4 shrink-0">-</span>

            {/* Box 2: State Code (TN) */}
            <div className="w-14 sm:w-16 shrink-0">
              <input
                ref={inputRef2}
                type="text"
                maxLength={3}
                placeholder="TN"
                value={regParts.p2}
                disabled={!!initialData || !isEligible}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  const updated = { ...regParts, p2: val };
                  updateRegNumber(updated);
                  if (val.length >= 2) {
                    inputRef3.current?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !regParts.p2) {
                    // stays in box 2 because box 1 is read-only
                  }
                }}
                onPaste={handleRegPaste}
                className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-white border border-slate-300 focus:border-tnnavy-500 focus:ring-2 focus:ring-tnnavy-200 text-slate-900 rounded-lg py-2.5 px-1 outline-none uppercase shadow-xs transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <span className="block text-[10px] text-center text-slate-400 mt-1 font-medium">State</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mb-4 shrink-0">-</span>

            {/* Box 3: District / Port Code (e.g. CHE / RMS / 07) */}
            <div className="w-16 sm:w-20 shrink-0">
              <input
                ref={inputRef3}
                type="text"
                maxLength={4}
                placeholder="CHE"
                value={regParts.p3}
                disabled={!!initialData || !isEligible}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  const updated = { ...regParts, p3: val };
                  updateRegNumber(updated);
                  if (val.length >= 3) {
                    inputRef4.current?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !regParts.p3) {
                    inputRef2.current?.focus();
                  }
                }}
                onPaste={handleRegPaste}
                className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-white border border-slate-300 focus:border-tnnavy-500 focus:ring-2 focus:ring-tnnavy-200 text-slate-900 rounded-lg py-2.5 px-1 outline-none uppercase shadow-xs transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <span className="block text-[10px] text-center text-slate-400 mt-1 font-medium">Port / Dist</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mb-4 shrink-0">-</span>

            {/* Box 4: Craft / Boat Type Code (e.g. MM / OB / IB) */}
            <div className="w-14 sm:w-16 shrink-0">
              <input
                ref={inputRef4}
                type="text"
                maxLength={3}
                placeholder="MM"
                value={regParts.p4}
                disabled={!!initialData || !isEligible}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  const updated = { ...regParts, p4: val };
                  updateRegNumber(updated);
                  if (val.length >= 2) {
                    inputRef5.current?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !regParts.p4) {
                    inputRef3.current?.focus();
                  }
                }}
                onPaste={handleRegPaste}
                className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-white border border-slate-300 focus:border-tnnavy-500 focus:ring-2 focus:ring-tnnavy-200 text-slate-900 rounded-lg py-2.5 px-1 outline-none uppercase shadow-xs transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <span className="block text-[10px] text-center text-slate-400 mt-1 font-medium">Type</span>
            </div>

            <span className="text-slate-400 font-bold text-sm mb-4 shrink-0">-</span>

            {/* Box 5: Serial / Number (e.g. 000123) */}
            <div className="flex-1 sm:w-28 sm:flex-none">
              <input
                ref={inputRef5}
                type="text"
                maxLength={7}
                placeholder="000123"
                value={regParts.p5}
                disabled={!!initialData || !isEligible}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  const updated = { ...regParts, p5: val };
                  updateRegNumber(updated);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !regParts.p5) {
                    inputRef4.current?.focus();
                  }
                }}
                onPaste={handleRegPaste}
                className="w-full text-center font-mono font-bold text-xs sm:text-sm bg-white border border-slate-300 focus:border-tnnavy-500 focus:ring-2 focus:ring-tnnavy-200 text-slate-900 rounded-lg py-2.5 px-2 outline-none uppercase shadow-xs transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              <span className="block text-[10px] text-center text-slate-400 mt-1 font-medium">Serial No.</span>
            </div>
          </div>

          {/* Hidden input to bind with react-hook-form */}
          <input type="hidden" {...register('registrationNumber')} />

          {/* Error & helper preview */}
          {errors.registrationNumber ? (
            <p className="mt-1 text-xs text-rose-500">{errors.registrationNumber.message}</p>
          ) : (
            <div className="mt-1.5 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {initialData ? 'Registration number cannot be modified' : 'Will be stored in database as shown:'}
              </span>
              {(regParts.p2 || regParts.p3 || regParts.p4 || regParts.p5) && (
                <span className="font-mono font-bold text-tnnavy-800 bg-tnnavy-50 px-2 py-0.5 rounded border border-tnnavy-200">
                  {`IND-${regParts.p2 || 'TN'}-${regParts.p3 || 'CHE'}-${regParts.p4 || 'MM'}-${regParts.p5 || '000123'}`}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Location & Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select
          label="District"
          required
          disabled={!isEligible}
          options={districtOptions}
          {...register('district')}
          error={errors.district?.message}
        />

        <Select
          label="Assigned Harbour / Port"
          required
          disabled={!isEligible}
          options={harbourOptions}
          {...register('port')}
          error={errors.port?.message}
        />

        <Select
          label="Operational Status"
          disabled={!isEligible}
          options={[
            { value: 'ACTIVE', label: 'ACTIVE (Operational)' },
            { value: 'INACTIVE', label: 'INACTIVE (Dry Dock / Repair)' },
            { value: 'BLOCKED', label: 'BLOCKED (Maritime Notice)' },
          ]}
          {...register('status')}
          error={errors.status?.message}
        />
      </div>

      <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          {!isEligible && (
            <span className="text-rose-600 font-semibold flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Verified Fisherman ID required for registration
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" type="button" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="submit"
            isLoading={isLoading}
            disabled={!isEligible || isLoading}
            title={!isEligible ? "Please enter an existing, valid Fisherman ID first" : undefined}
          >
            {initialData ? 'Update Boat Record' : 'Register Boat Owner'}
          </Button>
        </div>
      </div>
    </form>
  );
};
