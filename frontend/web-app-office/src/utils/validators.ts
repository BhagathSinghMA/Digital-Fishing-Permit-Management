import { z } from 'zod';

export const boatOwnerSchema = z.object({
  registrationNumber: z
    .string()
    .min(3, 'Registration number must be at least 3 characters')
    .max(50, 'Registration number is too long')
    .regex(/^[A-Z0-9-]+$/i, 'Registration number must contain alphanumeric characters and hyphens only')
    .transform(val => val.trim().toUpperCase()),
  boatName: z
    .string()
    .min(2, 'Boat name must be at least 2 characters')
    .max(100, 'Boat name is too long')
    .transform(val => val.trim()),
  ownerName: z
    .string()
    .min(2, 'Owner name must be at least 2 characters')
    .max(100, 'Owner name is too long')
    .transform(val => val.trim()),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number')
    .transform(val => val.trim()),
  fishermanId: z
    .string()
    .min(3, 'Fisherman ID must be at least 3 characters')
    .max(50, 'Fisherman ID is too long')
    .transform(val => val.trim().toUpperCase()),
  district: z
    .string()
    .min(2, 'Please select a valid district'),
  port: z
    .string()
    .min(2, 'Please select a valid harbour/port'),
  state: z
    .string()
    .default('Tamil Nadu'),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
    .default('ACTIVE'),
});

export type BoatOwnerFormValues = z.infer<typeof boatOwnerSchema>;

export const fishermanSchema = z.object({
  fishermanId: z
    .string()
    .min(3, 'Fisherman ID must be at least 3 characters')
    .max(50, 'Fisherman ID is too long')
    .regex(/^[A-Z0-9-]+$/i, 'Fisherman ID must contain letters, numbers, and hyphens only')
    .transform(val => val.trim().toUpperCase()),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long')
    .transform(val => val.trim()),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number')
    .transform(val => val.trim()),
  district: z
    .string()
    .min(2, 'Please select a valid district'),
  port: z
    .string()
    .min(2, 'Please select a valid harbour'),
  village: z
    .string()
    .optional()
    .transform(val => (val ? val.trim() : '')),
  address: z
    .string()
    .optional()
    .transform(val => (val ? val.trim() : '')),
  photo: z
    .string()
    .optional(),
  status: z
    .enum(['ACTIVE', 'INACTIVE', 'BLOCKED'])
    .default('ACTIVE'),
});

export type FishermanFormValues = z.infer<typeof fishermanSchema>;

export const rejectReasonSchema = z.object({
  reason: z
    .string()
    .min(5, 'Rejection reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export type RejectReasonFormValues = z.infer<typeof rejectReasonSchema>;

export const blockReasonSchema = z.object({
  reason: z
    .string()
    .min(5, 'Block reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
});

export type BlockReasonFormValues = z.infer<typeof blockReasonSchema>;
