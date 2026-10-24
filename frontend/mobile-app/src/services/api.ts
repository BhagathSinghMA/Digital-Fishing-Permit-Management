import axios from 'axios';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { getAuthToken, clearAuthData } from './storage';

// For local testing: physical device needs host IP, emulator/web can use localhost / 10.0.2.2
// Default fallback host for Metro/Expo bundler
const getBaseUrl = () => {
  // Extract host IP when running via Expo (Expo Go or Dev Client on physical device)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    (Constants.manifest2 as any)?.extra?.expoGo?.debuggerHost;

  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      console.log(`[API] Detected host machine IP from Expo: http://${hostIp}:8082`);
      return `http://${hostIp}:8082`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8082';
  }
  return 'http://localhost:8082';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  timeout: 10000,
});

// Request interceptor to attach bearer token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage errors on request
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiry / 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('[API] 401 Unauthorized received, clearing auth data');
      await clearAuthData();
    }
    return Promise.reject(error);
  }
);

export interface SendOtpPayload {
  registrationNumber: string;
}

export interface VerifyOtpPayload {
  registrationNumber: string;
  otp: string;
}

export interface BoatOwnerData {
  id: number;
  registrationNumber: string;
  ownerName: string;
  phoneNumber: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  boatOwner?: BoatOwnerData;
}

export const sendBoatOtp = async (registrationNumber: string): Promise<ApiResponse> => {
  try {
    const formattedRegNum = registrationNumber.trim().toUpperCase();
    const response = await api.post<ApiResponse>('/api/auth/boat/send-otp', {
      registrationNumber: formattedRegNum,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error or server unreachable',
    };
  }
};

export const verifyBoatOtp = async (registrationNumber: string, otp: string): Promise<ApiResponse> => {
  try {
    const formattedRegNum = registrationNumber.trim().toUpperCase();
    const response = await api.post<ApiResponse>('/api/auth/boat/verify-otp', {
      registrationNumber: formattedRegNum,
      otp: otp.trim(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error or server unreachable',
    };
  }
};

export interface SendFishermanOtpPayload {
  fishermanId: string;
}

export interface VerifyFishermanOtpPayload {
  fishermanId: string;
  otp: string;
}

export interface FishermanData {
  fishermanId: string;
  name: string;
  phoneNumber: string;
}

export interface FishermanApiResponse {
  success: boolean;
  message: string;
  fisherman?: FishermanData;
}

export const sendFishermanOtp = async (fishermanId: string): Promise<FishermanApiResponse> => {
  try {
    const formattedId = fishermanId.trim().toUpperCase();
    const response = await api.post<FishermanApiResponse>('/api/auth/fisherman/send-otp', {
      fishermanId: formattedId,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return {
        success: false,
        message: error.response.data.message || (error.response.status === 404 ? 'Fisherman ID not found' : 'Failed to send OTP'),
        ...error.response.data,
      };
    }
    return {
      success: false,
      message: 'Unable to connect to the Fisheries server.',
    };
  }
};

export const verifyFishermanOtp = async (fishermanId: string, otp: string): Promise<FishermanApiResponse> => {
  try {
    const formattedId = fishermanId.trim().toUpperCase();
    const response = await api.post<FishermanApiResponse>('/api/auth/fisherman/verify-otp', {
      fishermanId: formattedId,
      otp: otp.trim(),
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Network error or server unreachable',
    };
  }
};

export interface BoatProfileResponse {
  boatName: string;
  registrationNumber: string;
  ownerName: string;
  phoneNumber?: string;
  fishermanId?: string;
  district?: string;
  state?: string;
  port?: string;
  date: string;
}

export interface PermitHistoryItem {
  permitNumber: string;
  boatName: string;
  registrationNumber: string;
  issuedDate: string;
  expiryDate: string;
  crewCount: number;
  status: string; // Completed, Expired, Cancelled, Rejected, Pending, Approved
}

export interface CrewMemberItem {
  fishermanId: string;
  name: string;
  phoneNumber: string;
}

export interface LivePermitData {
  hasActivePermit: boolean;
  permitNumber: string;
  boatName: string;
  registrationNumber: string;
  ownerName: string;
  issuedTime: string;
  expiryTime: string;
  crewCount: number;
  status: string; // PENDING, APPROVED, REJECTED, EXPIRED, NO_PERMIT
  rejectionReason?: string;
  crewMembers: CrewMemberItem[];
}

export interface FishermanSearchResult {
  id: number | string;
  fishermanId: string;
  name: string;
  phoneNumber: string;
}

export interface CrewConflictItem {
  fishermanId: string;
  fishermanName?: string;
  boatRegistration: string;
  boatName?: string;
  permitStatus: string;
  expiresAt?: string;
}

export interface CrewResponse {
  success: boolean;
  message: string;
  permitId?: number;
  permitNumber?: string;
  status?: string;
  conflicts?: CrewConflictItem[];
}

export const getBoatOwnerProfile = async (registrationNumber?: string): Promise<BoatProfileResponse | null> => {
  try {
    const url = registrationNumber
      ? `/api/boat-owner/profile?registrationNumber=${encodeURIComponent(registrationNumber.trim().toUpperCase())}`
      : '/api/boat-owner/profile';
    const response = await api.get<BoatProfileResponse>(url);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch boat owner profile:', error);
    return null;
  }
};

export const getPermitHistory = async (registrationNumber?: string): Promise<PermitHistoryItem[]> => {
  try {
    const url = registrationNumber
      ? `/api/permits/history?registrationNumber=${encodeURIComponent(registrationNumber.trim().toUpperCase())}`
      : '/api/permits/history';
    const response = await api.get<PermitHistoryItem[]>(url);
    console.log('[API] getPermitHistory count:', response.data?.length);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch permit history:', error);
    return [];
  }
};

export const getLivePermit = async (registrationNumber?: string): Promise<LivePermitData | null> => {
  try {
    const url = registrationNumber
      ? `/api/permit/live?registrationNumber=${encodeURIComponent(registrationNumber.trim().toUpperCase())}`
      : '/api/permit/live';
    const response = await api.get<LivePermitData>(url);
    console.log('[API] getLivePermit status:', response.data?.status, 'hasActive:', response.data?.hasActivePermit);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch live permit:', error);
    return null;
  }
};

export const searchFishermen = async (id: string): Promise<FishermanSearchResult[]> => {
  try {
    const response = await api.get<FishermanSearchResult[]>(`/api/fishermen/search?id=${encodeURIComponent(id)}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to search fishermen:', error);
    return [];
  }
};

export const submitCrew = async (registrationNumber: string, crewMembers: string[]): Promise<CrewResponse> => {
  try {
    const response = await api.post<CrewResponse>('/api/permit/crew', {
      registrationNumber: registrationNumber.trim().toUpperCase(),
      crewMembers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const serverMessage =
        typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || error.response.data.error;
      return {
        success: false,
        message: serverMessage || 'Failed to submit crew members. Please try again.',
        conflicts: error.response.data.conflicts,
      };
    }
    return {
      success: false,
      message: 'Failed to submit crew members. Please try again.',
    };
  }
};

export const applyPermit = async (registrationNumber: string, crewMembers: string[]): Promise<CrewResponse> => {
  try {
    const response = await api.post<CrewResponse>('/api/permit/apply', {
      registrationNumber: registrationNumber.trim().toUpperCase(),
      crewMembers,
    });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      const serverMessage =
        typeof error.response.data === 'string'
          ? error.response.data
          : error.response.data.message || error.response.data.error;
      return {
        success: false,
        message: serverMessage || 'Failed to apply permit. Please try again.',
        conflicts: error.response.data.conflicts,
      };
    }
    return {
      success: false,
      message: 'Failed to apply permit. Please try again.',
    };
  }
};

export const getPendingPermits = async (): Promise<any[]> => {
  try {
    const response = await api.get<any[]>('/api/officer/permits/pending');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch pending permits:', error);
    return [];
  }
};

export const approvePermit = async (id: number): Promise<CrewResponse> => {
  try {
    const response = await api.put<CrewResponse>(`/api/officer/permit/${id}/approve`);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Failed to approve permit.',
    };
  }
};

export const rejectPermit = async (id: number, reason?: string): Promise<CrewResponse> => {
  try {
    const response = await api.put<CrewResponse>(`/api/officer/permit/${id}/reject`, { reason });
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: 'Failed to reject permit.',
    };
  }
};

export interface FishermanHomeData {
  name: string;
  fishermanId: string;
  currentPermit?: {
    permitNumber: string;
    boatName: string;
    registrationNumber: string;
    ownerName: string;
    status: string;
    issueDate: string;
    expiryDate: string;
  } | null;
}

export interface FishermanLivePermitData {
  hasActivePermit: boolean;
  permitNumber?: string;
  boatName?: string;
  registrationNumber?: string;
  ownerName?: string;
  issuedTime?: string;
  expiryTime?: string;
  status?: string;
  crewMembers?: Array<{
    fishermanId: string;
    name: string;
    phoneNumber: string;
  }>;
}

export interface FishermanPermitHistoryItem {
  permitNumber: string;
  boatName: string;
  registrationNumber: string;
  ownerName: string;
  issuedDate: string;
  expiryDate: string;
  status: string;
}

export interface FishermanProfileData {
  id?: number | string;
  fishermanId: string;
  name: string;
  phoneNumber: string;
  district?: string;
  state?: string;
  village?: string;
}

export const getFishermanHome = async (fishermanId?: string): Promise<FishermanHomeData | null> => {
  try {
    const url = fishermanId
      ? `/api/fisherman/home?fishermanId=${encodeURIComponent(fishermanId.trim().toUpperCase())}`
      : '/api/fisherman/home';
    const response = await api.get<FishermanHomeData>(url);
    console.log('[API] getFishermanHome status:', response.data?.currentPermit?.status);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch fisherman home data:', error);
    return null;
  }
};

export const getFishermanLivePermit = async (fishermanId?: string): Promise<FishermanLivePermitData | null> => {
  try {
    const url = fishermanId
      ? `/api/fisherman/permit/live?fishermanId=${encodeURIComponent(fishermanId.trim().toUpperCase())}`
      : '/api/fisherman/permit/live';
    const response = await api.get<FishermanLivePermitData>(url);
    console.log('[API] getFishermanLivePermit status:', response.data?.status, 'hasActive:', response.data?.hasActivePermit);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch fisherman live permit:', error);
    return null;
  }
};

export const getFishermanPermitHistory = async (fishermanId?: string): Promise<FishermanPermitHistoryItem[]> => {
  try {
    const url = fishermanId
      ? `/api/fisherman/permits/history?fishermanId=${encodeURIComponent(fishermanId.trim().toUpperCase())}`
      : '/api/fisherman/permits/history';
    const response = await api.get<FishermanPermitHistoryItem[]>(url);
    console.log('[API] getFishermanPermitHistory count:', response.data?.length);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch fisherman permit history:', error);
    return [];
  }
};

export const getFishermanProfile = async (fishermanId?: string): Promise<FishermanProfileData | null> => {
  try {
    const url = fishermanId
      ? `/api/fisherman/profile?fishermanId=${encodeURIComponent(fishermanId.trim().toUpperCase())}`
      : '/api/fisherman/profile';
    const response = await api.get<FishermanProfileData>(url);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch fisherman profile:', error);
    return null;
  }
};

export interface ApplicationStatusResponse {
  permitApplicationOpen: boolean;
  title: string;
  message: string;
}

export const getApplicationStatus = async (): Promise<ApplicationStatusResponse> => {
  try {
    const response = await api.get<ApplicationStatusResponse>('/api/app/application-status');
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch permit application status:', error);
    return {
      permitApplicationOpen: true,
      title: 'Permits Open',
      message: 'Daily fishing permit applications are currently open.',
    };
  }
};

export default api;
