export type UserRole = 'OFFICER' | 'MAIN_OFFICER' | 'SUPER_ADMIN';

export type PermitStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'ACTIVE';

export interface User {
  id: string | number;
  username: string;
  name: string;
  role: UserRole;
  assignedHarbour?: string; // Required for Harbour Officer (e.g., 'Rameswaram')
  phoneNumber?: string;
  officerId?: string;
  token?: string;
}

export interface CrewMember {
  fishermanId: string;
  name: string;
  phoneNumber: string;
  role?: string;
  biometricVerified?: boolean;
  emergencyContact?: string;
  bloodGroup?: string;
}

export interface Permit {
  id: number;
  permitNumber?: string;
  registrationNumber: string;
  boatName: string;
  ownerName: string;
  ownerPhone?: string;
  port: string;
  district?: string;
  state?: string;
  fishermanId?: string;
  permitDate?: string;
  expiryDate?: string;
  status: PermitStatus;
  rejectionReason?: string;
  submittedTime: string;
  approvedTime?: string;
  crewCount: number;
  crewMembers?: CrewMember[];
  qrToken?: string;
  createdAt?: string;
}

export interface BoatOwner {
  id?: number;
  registrationNumber: string;
  boatName: string;
  ownerName: string;
  phoneNumber: string;
  fishermanId: string;
  district: string;
  port: string;
  state?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  createdAt?: string;
  updatedAt?: string;
}

export interface Fisherman {
  fishermanId: string;
  name: string;
  phoneNumber: string;
  district: string;
  port: string;
  village?: string;
  address?: string;
  state?: string;
  photo?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  boatAssigned?: string;
  permitStatus?: 'NO_PERMIT' | 'PENDING' | 'APPROVED' | 'ON_SEA' | 'EXPIRED';
  isBlocked?: boolean;
  blockReason?: string;
  blockDate?: string;
  createdAt?: string;
}

export interface BlockedFishermanRecord {
  id?: string | number;
  fishermanId: string;
  name: string;
  harbour: string;
  district: string;
  blockDate: string;
  reason: string;
  phone?: string;
  blockedBy?: string;
}

export interface OfficerDashboardKPIs {
  pendingPermits: number;
  approvedToday: number;
  rejectedToday: number;
  harbourBoatOwners: number;
  harbourBlockedFishermen: number;
  harbourRegisteredFishermen: number;
  permitApplicationOpen: boolean;
}

export interface MainOfficerDashboardKPIs {
  totalBoatOwners: number;
  totalFishermen: number;
  activeBoatOwners: number;
  blockedBoatOwners: number;
  blockedFishermen: number;
  permitApplicationOpen: boolean;
  harbourBoatDistribution: { harbour: string; count: number; active: number }[];
  harbourFishermanDistribution: { harbour: string; count: number }[];
  recentPermits: Permit[];
}

export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
