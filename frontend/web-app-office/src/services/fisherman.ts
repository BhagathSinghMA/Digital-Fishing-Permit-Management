import apiClient from './api';
import { Fisherman, BlockedFishermanRecord, PageResponse } from '../types';

export interface FishermanQueryParams {
  search?: string;
  harbour?: string;
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

export const fishermanService = {
  async getFishermen(params: FishermanQueryParams): Promise<PageResponse<Fisherman>> {
    try {
      const response = await apiClient.get('/api/admin/fishermen', {
        params: {
          search: params.search || undefined,
          page: params.page || 0,
          size: params.size || 10,
        },
      });

      const data = response.data;
      if (data && Array.isArray(data.content)) {
        let items: Fisherman[] = data.content.map((f: any) => ({
          fishermanId: f.fishermanId,
          name: f.name,
          phoneNumber: f.phoneNumber,
          district: f.district || 'Tamil Nadu',
          port: f.port || f.village || f.district || 'Tamil Nadu',
          village: f.village || '',
          address: f.address || '',
          state: f.state || 'Tamil Nadu',
          status: f.status || 'ACTIVE',
          boatAssigned: 'None',
          permitStatus: 'NO_PERMIT',
          isBlocked: f.status === 'BLOCKED',
          createdAt: f.createdAt,
        }));

        if (params.harbour) {
          items = items.filter(
            (f) => matchesHarbour(f.port, params.harbour) || matchesHarbour(f.district, params.harbour)
          );
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
      const message = err.response?.data?.message || err.message || 'Failed to load statewide fisherman registry.';
      throw new Error(message);
    }
  },

  // Zero-preload search used exclusively by Harbour Officer Search page (strictly by Fisherman ID)
  async searchFisherman(query: string, harbour?: string): Promise<Fisherman[]> {
    if (!query || query.trim().length < 2) return [];
    const cleanQuery = query.trim().toLowerCase();

    try {
      const response = await apiClient.get('/api/admin/fishermen', {
        params: { search: query.trim(), size: 50 },
      });

      if (response.data && Array.isArray(response.data.content)) {
        let results: Fisherman[] = response.data.content
          .filter((f: any) => f.fishermanId && f.fishermanId.toLowerCase().includes(cleanQuery))
          .map((f: any) => ({
            fishermanId: f.fishermanId,
            name: f.name,
            phoneNumber: f.phoneNumber,
            district: f.district || 'Tamil Nadu',
            port: f.port || f.village || f.district || harbour || 'Tamil Nadu',
            village: f.village || '',
            address: f.address || '',
            state: f.state || 'Tamil Nadu',
            status: f.status || 'ACTIVE',
            boatAssigned: f.boatAssigned || 'None',
            permitStatus: f.permitStatus || 'NO_PERMIT',
            isBlocked: f.status === 'BLOCKED',
            createdAt: f.createdAt,
          }));

        if (harbour) {
          const filtered = results.filter(
            (f) => matchesHarbour(f.port, harbour) || matchesHarbour(f.district, harbour)
          );
          if (filtered.length > 0) return filtered;
        }
        return results;
      }
      return [];
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to search fishermen.';
      throw new Error(message);
    }
  },

  async getFishermanById(fishermanId: string): Promise<Fisherman> {
    try {
      const response = await apiClient.get(`/api/admin/fishermen/${encodeURIComponent(fishermanId)}`);
      const f = response.data;
      return {
        fishermanId: f.fishermanId,
        name: f.name,
        phoneNumber: f.phoneNumber,
        district: f.district || 'Tamil Nadu',
        port: f.port || f.village || f.district || 'Tamil Nadu',
        village: f.village || '',
        address: f.address || '',
        state: f.state || 'Tamil Nadu',
        status: f.status || 'ACTIVE',
        boatAssigned: 'None',
        permitStatus: 'NO_PERMIT',
        isBlocked: f.status === 'BLOCKED',
        createdAt: f.createdAt,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || `Fisherman '${fishermanId}' not found.`;
      throw new Error(message);
    }
  },

  async createFisherman(data: Fisherman): Promise<Fisherman> {
    try {
      const response = await apiClient.post('/api/admin/fishermen', {
        fishermanId: data.fishermanId.trim().toUpperCase(),
        name: data.name.trim(),
        phoneNumber: data.phoneNumber.trim(),
        district: data.district,
        port: data.port,
        village: data.village || '',
        address: data.address || '',
        status: data.status || 'ACTIVE',
        state: data.state || 'Tamil Nadu',
      });

      const resData = response.data;
      return {
        fishermanId: resData.fishermanId,
        name: resData.name,
        phoneNumber: resData.phoneNumber,
        district: resData.district || 'Tamil Nadu',
        port: resData.port || resData.village || data.port || 'Tamil Nadu',
        village: resData.village || '',
        address: resData.address || '',
        state: resData.state || 'Tamil Nadu',
        status: resData.status || 'ACTIVE',
        boatAssigned: 'None',
        permitStatus: 'NO_PERMIT',
        isBlocked: resData.status === 'BLOCKED',
        createdAt: resData.createdAt,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to register fisherman.';
      throw new Error(message);
    }
  },

  async updateFisherman(fishermanId: string, data: Partial<Fisherman>): Promise<Fisherman> {
    try {
      const fId = (fishermanId || data.fishermanId || '').trim().toUpperCase();
      const response = await apiClient.put(`/api/admin/fishermen/${encodeURIComponent(fId)}`, {
        fishermanId: fId,
        name: data.name?.trim(),
        phoneNumber: data.phoneNumber?.trim(),
        district: data.district,
        port: data.port,
        village: data.village || '',
        address: data.address || '',
        status: data.status || 'ACTIVE',
        state: data.state || 'Tamil Nadu',
      });
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update fisherman.';
      throw new Error(message);
    }
  },

  async deleteFisherman(fishermanId: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/admin/fishermen/${encodeURIComponent(fishermanId)}`);
      return response.data || { success: true, message: 'Fisherman deleted successfully' };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response?.status ? `Failed to delete fisherman (${err.response.status}): ${err.response.statusText || 'Server error'}` : null) ||
        err.message ||
        'Failed to delete fisherman.';
      throw new Error(message);
    }
  },

  async blockFisherman(fishermanId: string, reason?: string): Promise<Fisherman> {
    try {
      const existing = await this.getFishermanById(fishermanId);
      const updated = await this.updateFisherman(fishermanId, {
        ...existing,
        status: 'BLOCKED',
      });
      return {
        ...updated,
        isBlocked: true,
        blockReason: reason || 'Violation of maritime zone safety guidelines',
        blockDate: new Date().toISOString(),
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || `Failed to block fisherman '${fishermanId}'.`;
      throw new Error(message);
    }
  },

  async unblockFisherman(fishermanId: string): Promise<Fisherman> {
    try {
      const existing = await this.getFishermanById(fishermanId);
      const updated = await this.updateFisherman(fishermanId, {
        ...existing,
        status: 'ACTIVE',
      });
      return {
        ...updated,
        isBlocked: false,
        blockReason: undefined,
        blockDate: undefined,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || `Failed to unblock fisherman '${fishermanId}'.`;
      throw new Error(message);
    }
  },

  async getBlockedFishermen(params: FishermanQueryParams): Promise<PageResponse<BlockedFishermanRecord>> {
    try {
      const response = await this.getFishermen({
        ...params,
        size: 100,
      });

      const blockedList: BlockedFishermanRecord[] = response.content
        .filter((f) => f.isBlocked || f.status === 'BLOCKED')
        .map((f) => ({
          fishermanId: f.fishermanId,
          name: f.name,
          harbour: f.port,
          district: f.district,
          blockDate: f.createdAt || new Date().toISOString(),
          reason: 'Security or safety non-compliance violation',
          phone: f.phoneNumber,
        }));

      const page = params.page || 0;
      const size = params.size || 10;
      const start = page * size;
      const paginated = blockedList.slice(start, start + size);

      return {
        content: paginated,
        pageNumber: page,
        pageSize: size,
        totalElements: blockedList.length,
        totalPages: Math.ceil(blockedList.length / size) || 1,
        isLast: start + size >= blockedList.length,
      };
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to load blocked fishermen.';
      throw new Error(message);
    }
  },
};
