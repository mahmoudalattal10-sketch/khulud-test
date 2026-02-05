import { apiRequest, ApiResponse } from './api-client';
import { Hotel, Room } from '../types';
import { staticHotels } from '../data/staticHotels';

/**
 * ============================================
 * 🏨 HOTELS API SERVICE
 * ============================================
 */
export const HotelsAPI = {
    getAll: async (params?: { city?: string; checkIn?: string; checkOut?: string; guests?: number; adminView?: boolean }): Promise<ApiResponse<Hotel[]>> => {
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).filter(([_, v]) => v != null)
        );
        const query = new URLSearchParams(cleanParams as any).toString();
        const response = await apiRequest<Hotel[]>(`/hotels?${query}`, {}, true);

        // [NEW] Inject static hotels
        if (response.success && response.data) {
            // merge avoiding duplicates if IDs clash (though they shouldn't with our static IDs)
            const staticIds = new Set(staticHotels.map(h => h.id));
            const apiHotels = response.data.filter(h => !staticIds.has(h.id));
            response.data = [...staticHotels, ...apiHotels];
        } else if (!response.success) {
            // Fallback to static if API fails
            return { success: true, data: staticHotels };
        }

        return response;
    },

    getBySlug: async (slug: string, params?: { checkIn?: string; checkOut?: string; guests?: number }): Promise<ApiResponse<Hotel>> => {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        const response = await apiRequest<Hotel>(`/hotels/${slug}${query}`);

        if (response.success && response.data) {
            return response;
        }

        // [NEW] Fallback to static data
        const staticHotel = staticHotels.find(h => h.slug === slug);
        if (staticHotel) {
            return { success: true, data: staticHotel };
        }

        return response;
    },

    getById: async (id: string, params?: { checkIn?: string; checkOut?: string; guests?: number }): Promise<ApiResponse<Hotel>> => {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        const response = await apiRequest<Hotel>(`/hotels/id/${id}${query}`);

        if (response.success && response.data) {
            return response;
        }

        // [NEW] Fallback to static data
        const staticHotel = staticHotels.find(h => h.id === id);
        if (staticHotel) {
            return { success: true, data: staticHotel };
        }

        return response;
    },

    getByIds: async (ids: string[]): Promise<ApiResponse<Hotel[]>> => {
        if (ids.length === 0) return { success: true, data: [] };
        return apiRequest<Hotel[]>(`/hotels/list?ids=${ids.join(',')}`);
    },

    create: async (hotelData: Partial<Hotel>): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>('/hotels', {
            method: 'POST',
            body: JSON.stringify(hotelData),
        }, true);
    },

    update: async (id: string, hotelData: Partial<Hotel>): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>(`/hotels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(hotelData),
        }, true);
    },

    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/hotels/${id}`, {
            method: 'DELETE',
        }, true);
    },

    toggleVisibility: async (id: string): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>(`/hotels/${id}/visibility`, {
            method: 'PATCH',
        }, true);
    },

    getFeatured: async (): Promise<ApiResponse<Hotel[]>> => {
        const response = await apiRequest<Hotel[]>('/hotels/featured');
        // [NEW] Inject static hotels into featured as well
        if (response.success && response.data) {
            const staticIds = new Set(staticHotels.map(h => h.id));
            const apiHotels = response.data.filter(h => !staticIds.has(h.id));
            response.data = [...staticHotels, ...apiHotels];
        } else if (!response.success) {
            return { success: true, data: staticHotels };
        }
        return response;
    },

    toggleFeatured: async (id: string): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>(`/hotels/${id}/featured`, {
            method: 'PATCH',
        }, true);
    },
};

/**
 * ============================================
 * 🛏️ ROOMS API SERVICE
 * ============================================
 */
export const RoomsAPI = {
    create: async (hotelId: string, roomData: Partial<Room>): Promise<ApiResponse<Room>> => {
        return apiRequest<Room>(`/hotels/${hotelId}/rooms`, {
            method: 'POST',
            body: JSON.stringify(roomData),
        }, true);
    },

    update: async (roomId: string, roomData: Partial<Room>): Promise<ApiResponse<Room>> => {
        return apiRequest<Room>(`/rooms/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(roomData),
        }, true);
    },

    delete: async (roomId: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/rooms/${roomId}`, {
            method: 'DELETE',
        }, true);
    },
};
