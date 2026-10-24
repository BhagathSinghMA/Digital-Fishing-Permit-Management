import apiClient from './api';
import { Permit, PageResponse, OfficerDashboardKPIs, MainOfficerDashboardKPIs } from '../types';

export interface PermitQueryParams {
  status?: string;
  search?: string;
  harbour?: string;
  date?: string;
  page?: number;
  size?: number;
}

function matchesHarbour(itemPort?: string | null, targetHarbour?: string | null): boolean {
  if (!targetHarbour || targetHarbour.trim() === '') return true;
  if (!itemPort || itemPort.trim() === '') return true;

  const cleanItem = itemPort.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanTarget = targetHarbour.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

  return (
    cleanItem.includes(cleanTarget) ||
    cleanTarget.includes(cleanItem) ||
    (cleanItem.includes('rameshwar') && cleanTarget.includes('rameswar')) ||
    (cleanItem.includes('rameswar') && cleanTarget.includes('rameshwar')) ||
    (cleanItem.includes('chennai') && cleanTarget.includes('kasimedu')) ||
    (cleanItem.includes('kasimedu') && cleanTarget.includes('chennai'))
  );
}

export const permitService = {
  async getPermits(params: PermitQueryParams): Promise<PageResponse<Permit>> {
    try {
      const response = await apiClient.get('/api/admin/permits', {
        params: {
          status: params.status && params.status !== 'ALL' ? params.status : undefined,
          search: params.search || undefined,
          date: params.date || undefined,
          page: params.page || 0,
          size: params.size || 10,
        },
      });

      const data = response.data;
      if (data && Array.isArray(data.content)) {
        let items: Permit[] = data.content.map((p: any) => ({
          id: p.id,
          permitNumber: p.permitNumber || `TN-FP-2026-${String(p.id).padStart(6, '0')}`,
          boatName: p.boatName,
          registrationNumber: p.registrationNumber,
          ownerName: p.ownerName,
          crewCount: p.crewCount || 1,
          port: p.port || params.harbour || 'Tamil Nadu',
          status: p.status,
          submittedTime: p.submittedTime,
          approvedTime: p.approvedTime || (p.expiryDate ? new Date(new Date(p.expiryDate).getTime() - 24 * 60 * 60 * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : undefined),
          permitDate: p.permitDate,
          expiryDate: p.expiryDate,
          rejectionReason: p.rejectionReason,
          qrToken: `QR-TN-${p.registrationNumber}-${p.id}`,
        }));

        if (params.harbour) {
          items = items.filter((p) => matchesHarbour(p.port, params.harbour));
        }

        return {
          content: items,
          pageNumber: data.pageNumber ?? (params.page || 0),
          pageSize: data.pageSize ?? (params.size || 10),
          totalElements: data.totalElements ?? items.length,
          totalPages: data.totalPages ?? (Math.ceil(items.length / (params.size || 10)) || 1),
          isLast: data.isLast ?? true,
        };
      }

      return {
        content: [],
        pageNumber: params.page || 0,
        pageSize: params.size || 10,
        totalElements: 0,
        totalPages: 1,
        isLast: true,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to load permits.';
      throw new Error(message);
    }
  },

  async getPermitDetails(id: number): Promise<Permit> {
    try {
      const response = await apiClient.get(`/api/admin/permits/${id}`);
      const data = response.data;
      return {
        id: data.id,
        permitNumber: data.permitNumber || `TN-FP-2026-${String(data.id).padStart(6, '0')}`,
        boatName: data.boatName,
        registrationNumber: data.registrationNumber,
        ownerName: data.ownerName,
        ownerPhone: data.ownerPhone,
        port: data.port || 'Tamil Nadu',
        district: data.district,
        state: data.state,
        fishermanId: data.fishermanId,
        permitDate: data.permitDate,
        expiryDate: data.expiryDate,
        status: data.status,
        rejectionReason: data.rejectionReason,
        submittedTime: data.submittedTime,
        approvedTime: data.approvedTime || (data.expiryDate ? new Date(new Date(data.expiryDate).getTime() - 24 * 60 * 60 * 1000).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }) : undefined),
        crewCount: data.crewMembers ? data.crewMembers.length : 1,
        crewMembers: data.crewMembers,
        qrToken: `QR-TN-${data.registrationNumber}-${data.id}-VALID-PASS`,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || `Permit #${id} not found.`;
      throw new Error(message);
    }
  },

  async approvePermit(id: number): Promise<{ success: boolean; message: string; permitNumber: string }> {
    try {
      const response = await apiClient.put(`/api/admin/permits/${id}/approve`);
      return {
        success: true,
        message: response.data?.message || 'Permit approved successfully.',
        permitNumber: response.data?.permitNumber || `TN-FP-2026-${String(id).padStart(6, '0')}`,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to approve permit.';
      throw new Error(message);
    }
  },

  async rejectPermit(id: number, reason: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.put(`/api/admin/permits/${id}/reject`, { reason });
      return {
        success: true,
        message: response.data?.message || 'Permit rejected successfully.',
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to reject permit.';
      throw new Error(message);
    }
  },

  async getOfficerDashboardKPIs(harbour: string): Promise<OfficerDashboardKPIs> {
    try {
      const [statsRes, settingsRes, permitsRes, boatsRes, fishermenRes] = await Promise.all([
        apiClient.get('/api/admin/dashboard/stats', { params: { harbor: harbour } }),
        apiClient.get('/api/admin/settings'),
        apiClient.get('/api/admin/permits', { params: { size: 500 } }),
        apiClient.get('/api/admin/boat-owners', { params: { size: 500 } }),
        apiClient.get('/api/admin/fishermen', { params: { size: 500 } }),
      ]);

      const backendStats = statsRes.data;
      const isOpen = settingsRes.data?.permitApplicationOpen ?? backendStats?.permitApplicationOpen ?? true;

      // Calculate harbour-specific counts from real DB
      const harbourPermits = (permitsRes.data?.content || []).filter((p: any) =>
        matchesHarbour(p.port, harbour)
      );
      const harbourBoats = (boatsRes.data?.content || []).filter((b: any) =>
        matchesHarbour(b.port, harbour)
      );
      const harbourFishermen = (fishermenRes.data?.content || []).filter((f: any) =>
        matchesHarbour(f.port || f.district, harbour)
      );

      const pendingCount = harbourPermits.filter((p: any) => p.status === 'PENDING').length;
      const approvedTodayCount = harbourPermits.filter((p: any) => p.status === 'APPROVED').length;
      const rejectedTodayCount = harbourPermits.filter((p: any) => p.status === 'REJECTED').length;

      return {
        pendingPermits: pendingCount || backendStats?.pendingPermitRequests || 0,
        approvedToday: approvedTodayCount || backendStats?.todayApprovedPermits || 0,
        rejectedToday: rejectedTodayCount || backendStats?.todayRejectedPermits || 0,
        harbourBoatOwners: harbourBoats.length,
        harbourBlockedFishermen: harbourFishermen.filter((f: any) => f.status === 'BLOCKED').length,
        harbourRegisteredFishermen: harbourFishermen.length,
        permitApplicationOpen: isOpen,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to load officer dashboard KPIs.';
      throw new Error(message);
    }
  },

  async getMainOfficerDashboardKPIs(): Promise<MainOfficerDashboardKPIs> {
    try {
      const [boatsRes, fishermenRes, permitsRes, settingsRes] = await Promise.all([
        apiClient.get('/api/admin/boat-owners', { params: { size: 500 } }),
        apiClient.get('/api/admin/fishermen', { params: { size: 500 } }),
        apiClient.get('/api/admin/permits', { params: { size: 10 } }),
        apiClient.get('/api/admin/settings'),
      ]);

      const allBoats: any[] = boatsRes.data?.content || [];
      const allFishermen: any[] = fishermenRes.data?.content || [];
      const allPermits: any[] = permitsRes.data?.content || [];
      const isOpen = settingsRes.data?.permitApplicationOpen ?? true;

      // Group boat owners by harbour
      const harbourMap: Record<string, { total: number; active: number }> = {};
      allBoats.forEach((b) => {
        const port = b.port || 'Tamil Nadu';
        if (!harbourMap[port]) harbourMap[port] = { total: 0, active: 0 };
        harbourMap[port].total += 1;
        if (b.status === 'ACTIVE' || !b.status) harbourMap[port].active += 1;
      });

      const harbourBoatDistribution = Object.entries(harbourMap).map(([harbour, data]) => ({
        harbour,
        count: data.total,
        active: data.active,
      }));

      // Group fishermen by harbour
      const fHarbourMap: Record<string, number> = {};
      allFishermen.forEach((f) => {
        const port = f.port || f.district || 'Tamil Nadu';
        fHarbourMap[port] = (fHarbourMap[port] || 0) + 1;
      });

      const harbourFishermanDistribution = Object.entries(fHarbourMap).map(([harbour, count]) => ({
        harbour,
        count,
      }));

      return {
        totalBoatOwners: boatsRes.data?.totalElements ?? allBoats.length,
        totalFishermen: fishermenRes.data?.totalElements ?? allFishermen.length,
        activeBoatOwners: allBoats.filter((b) => b.status === 'ACTIVE' || !b.status).length,
        blockedBoatOwners: allBoats.filter((b) => b.status === 'BLOCKED').length,
        blockedFishermen: allFishermen.filter((f) => f.status === 'BLOCKED').length,
        permitApplicationOpen: isOpen,
        harbourBoatDistribution,
        harbourFishermanDistribution,
        recentPermits: allPermits.slice(0, 5),
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to load directorate dashboard KPIs.';
      throw new Error(message);
    }
  },

  async togglePermitWindow(isOpen: boolean): Promise<boolean> {
    try {
      await apiClient.put('/api/admin/settings/application-status', { permitApplicationOpen: isOpen });
      return isOpen;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update permit window status.';
      throw new Error(message);
    }
  },
};
