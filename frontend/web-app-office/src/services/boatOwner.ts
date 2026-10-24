import apiClient from './api';
import { BoatOwner, PageResponse } from '../types';

export interface BoatOwnerQueryParams {
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

export const boatOwnerService = {
  async getBoatOwners(params: BoatOwnerQueryParams): Promise<PageResponse<BoatOwner>> {
    try {
      const response = await apiClient.get('/api/admin/boat-owners', {
        params: {
          search: params.search || undefined,
          page: params.page || 0,
          size: params.size || 10,
        },
      });

      const data = response.data;
      if (data && Array.isArray(data.content)) {
        let items: BoatOwner[] = data.content;

        if (params.harbour) {
          items = items.filter((b) => matchesHarbour(b.port, params.harbour));
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
      const message = err.response?.data?.message || err.message || 'Failed to load statewide boat owner master database.';
      throw new Error(message);
    }
  },

  async getBoatOwnerByRegNo(registrationNumber: string): Promise<BoatOwner> {
    try {
      const response = await apiClient.get(`/api/admin/boat-owners/${encodeURIComponent(registrationNumber)}`);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || `Boat owner '${registrationNumber}' not found.`;
      throw new Error(message);
    }
  },

  async createBoatOwner(data: Omit<BoatOwner, 'id' | 'createdAt'>): Promise<BoatOwner> {
    try {
      const response = await apiClient.post('/api/admin/boat-owners', data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to register boat owner.';
      throw new Error(message);
    }
  },

  async updateBoatOwner(registrationNumber: string, data: Partial<BoatOwner>): Promise<BoatOwner> {
    try {
      const response = await apiClient.put(`/api/admin/boat-owners/${encodeURIComponent(registrationNumber)}`, data);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || err.message || 'Failed to update boat owner.';
      throw new Error(message);
    }
  },

  async deleteBoatOwner(registrationNumber: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/admin/boat-owners/${encodeURIComponent(registrationNumber)}`);
      return response.data || { success: true, message: 'Boat owner deleted successfully' };
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response?.status ? `Failed to delete boat owner (${err.response.status}): ${err.response.statusText || 'Server error'}` : null) ||
        err.message ||
        'Failed to delete boat owner.';
      throw new Error(message);
    }
  },
};
