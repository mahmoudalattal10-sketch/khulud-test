/// <reference types="vite/client" />

/**
 * =========================================================
 * 🚀 DIAFAT API SERVICE - Professional Data Layer
 * =========================================================
 * A centralized, type-safe API client for all backend communication.
 * This ensures consistency, error handling, and easy maintenance.
 * =========================================================
 */

// API Base URL - switches between dev and production
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? '/api'  // Production: Same origin
    : 'http://localhost:3001/api'); // Development: Local server

// ============================================
// 🏨 HOTEL TYPES (Matching Backend Schema)
// ============================================

export interface Room {
    id: string;
    name: string;
    type: string;
    capacity: number;
    price: number;
    availableStock: number;
    mealPlan: string;
    view: string | null;
    area: number | null;
    features: string[] | null;
    images: string[] | null;
    hotelId: string;
    sofa?: boolean;
    beds?: string;
    pricingPeriods?: {
        id: string;
        startDate: string;
        endDate: string;
        price: number;
    }[];
    partialMetadata?: {
        isPartial: boolean;
        availableFrom: string;
        availableTo: string;
        availableNightsCount: number;
        totalPrice: number;
        avgPrice: number;
    };
    occupancies?: {
        label: string;
        capacity: number;
        price: number;
        image: string;
    }[];
    allowExtraBed?: boolean;
    extraBedPrice?: number;
    maxExtraBeds?: number;
    isVisible?: boolean;
}

export interface Hotel {
    id: string;
    slug: string;
    name: string;
    nameEn: string;
    location: string;
    locationEn: string;
    city: string;
    country?: string;
    rating: number;
    reviews: number;
    basePrice: number;
    price?: number; // Added for compatibility
    image: string;
    images: string[];
    coords: [number, number];
    amenities: string[];
    description: string;
    isOffer: boolean;
    isFeatured: boolean; // ✨ الفندق المختار
    discount: string | null;
    distanceFromHaram?: string;
    extraBedStock: number;
    hasFreeBreakfast: boolean;
    hasFreeTransport: boolean;
    isVisible: boolean; // 🔒 التحكم في ظهور الفندق للعامة
    view?: string; // e.g. "Kaaba View"
    partialMatch?: boolean; // Tag for partial availability
    displayPrice?: number;
    rooms: Room[];
    guestReviews?: Review[];
    createdAt: string;
    updatedAt: string;
    nearbyLandmarks?: {
        name: string;
        distance: string;
        icon: string;
        type?: string;
    }[];
    lat?: string | number;
    lng?: string | number;
}

export interface Review {
    id: string;
    userName: string;
    rating: number;
    text: string;
    date: string;
    hotelId: string;
}

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    country: string | null;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface Booking {
    id: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
    paymentStatus: 'UNPAID' | 'PAID' | 'REFUNDED';
    paymentRef: string | null;
    userId: string;
    roomId: string;
    guestsCount: number;
    guestName?: string;
    guestEmail?: string;
    guestPhone?: string;
    specialRequests: string | null;
    createdAt: string;
}

export interface AdminStats {
    sales: number;
    activeBookings: number;
    profit: number; // Calculated as 15% margin on confirmed sales
    visitors: number;
    completionRate: number;
    totalBookings: number;
    confirmedCount: number; // Number of paid/confirmed bookings
    avgBookingValue: number; // Average value per confirmed booking
    monthlyStats?: { name: string; value: number; users: number }[];
    destinations?: { name: string; percentage: number; color: string; icon: string }[];
}

export interface AnalyticsData {
    weekly: { name: string; visitors: number; revenue: number }[];
    hotels: { name: string; val: string; rawVal: number; color: string }[];
    visitorSources?: {
        ksa: number;
        gulf: number;
        intl: number;
        top: { name: string; pct: number };
    };
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================
// 🔐 TOKEN MANAGEMENT
// ============================================

const TOKEN_KEY = 'diafat_auth_token';

export const TokenManager = {
    get: (): string | null => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },
    set: (token: string): void => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TOKEN_KEY, token);
        }
    },
    remove: (): void => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(TOKEN_KEY);
        }
    },
    getAuthHeader: (): { Authorization: string } | {} => {
        const token = TokenManager.get();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }
};

// ============================================
// 🌐 GENERIC FETCH WRAPPER
// ============================================

async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = false
): Promise<ApiResponse<T>> {
    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };

        // Add auth header if required or token exists
        if (requiresAuth || TokenManager.get()) {
            Object.assign(headers, TokenManager.getAuthHeader());
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers,
            credentials: 'include', // [CRITICAL] for HttpOnly cookies
            ...options,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
        };
    }
}

// ============================================
// 🏨 HOTELS API
// ============================================

export const HotelsAPI = {
    /**
     * Fetch all hotels with their rooms, optionally filtered
     */
    getAll: async (params?: { city?: string; checkIn?: string; checkOut?: string; guests?: number; adminView?: boolean }): Promise<ApiResponse<Hotel[]>> => {
        // Filter out undefined/null values
        const cleanParams = Object.fromEntries(
            Object.entries(params || {}).filter(([_, v]) => v != null)
        );
        const query = new URLSearchParams(cleanParams as any).toString();
        return apiRequest<Hotel[]>(`/hotels?${query}`);
    },

    /**
     * Fetch a single hotel by slug
     */
    getBySlug: async (slug: string, params?: { checkIn?: string; checkOut?: string; guests?: number }): Promise<ApiResponse<Hotel>> => {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiRequest<Hotel>(`/hotels/${slug}${query}`);
    },

    /**
     * Fetch a single hotel by ID
     */
    getById: async (id: string, params?: { checkIn?: string; checkOut?: string; guests?: number }): Promise<ApiResponse<Hotel>> => {
        const query = params ? `?${new URLSearchParams(params as any).toString()}` : '';
        return apiRequest<Hotel>(`/hotels/id/${id}${query}`);
    },

    /**
     * Create a new hotel (Admin only)
     */
    create: async (hotelData: Partial<Hotel>): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>('/hotels', {
            method: 'POST',
            body: JSON.stringify(hotelData),
        });
    },

    /**
     * Update an existing hotel (Admin only)
     */
    update: async (id: string, hotelData: Partial<Hotel>): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>(`/hotels/${id}`, {
            method: 'PUT',
            body: JSON.stringify(hotelData),
        });
    },

    /**
     * Delete a hotel (Admin only)
     */
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/hotels/${id}`, {
            method: 'DELETE',
        });
    },

    /**
     * Toggle hotel visibility (Admin only)
     */
    toggleVisibility: async (id: string): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>(`/hotels/${id}/visibility`, {
            method: 'PATCH',
        });
    },

    /**
     * Get featured hotels only (الفنادق المختارة)
     */
    getFeatured: async (): Promise<ApiResponse<Hotel[]>> => {
        return apiRequest<Hotel[]>('/hotels/featured');
    },

    /**
     * Toggle hotel featured status (Admin only)
     */
    toggleFeatured: async (id: string): Promise<ApiResponse<Hotel>> => {
        return apiRequest<Hotel>(`/hotels/${id}/featured`, {
            method: 'PATCH',
        });
    },
};

// ============================================
// 🛏️ ROOMS API
// ============================================

export const RoomsAPI = {
    /**
     * Create a new room for a hotel
     */
    create: async (hotelId: string, roomData: Partial<Room>): Promise<ApiResponse<Room>> => {
        return apiRequest<Room>(`/hotels/${hotelId}/rooms`, {
            method: 'POST',
            body: JSON.stringify(roomData),
        });
    },

    /**
     * Update a room
     */
    update: async (roomId: string, roomData: Partial<Room>): Promise<ApiResponse<Room>> => {
        return apiRequest<Room>(`/rooms/${roomId}`, {
            method: 'PUT',
            body: JSON.stringify(roomData),
        });
    },

    /**
     * Delete a room
     */
    delete: async (roomId: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/rooms/${roomId}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// 📅 BOOKINGS API
// ============================================

export const BookingsAPI = {
    /**
     * Get all bookings (Admin only)
     */
    getAll: async (): Promise<ApiResponse<Booking[]>> => {
        return apiRequest<Booking[]>('/bookings');
    },

    /**
     * Get bookings for current user
     */
    getMyBookings: async (): Promise<ApiResponse<Booking[]>> => {
        return apiRequest<Booking[]>('/bookings/me', {}, true);
    },

    /**
     * Create a new booking
     */
    create: async (bookingData: {
        roomId: string;
        checkIn: string;
        checkOut: string;
        guestsCount: number;
        roomCount?: number; // <--- ADDED
        guestName?: string;
        guestEmail?: string;
        guestPhone?: string;
        extraBedCount?: number;
        specialRequests?: string;
        promoCode?: string; // <--- ADDED
    }): Promise<ApiResponse<Booking>> => {
        return apiRequest<Booking>('/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData),
        }, true);
    },

    /**
     * Update booking status (Admin only)
     */
    updateStatus: async (
        id: string,
        status: Booking['status']
    ): Promise<ApiResponse<Booking>> => {
        return apiRequest<Booking>(`/bookings/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        }, true);
    },

    /**
     * Cancel a booking
     */
    cancel: async (id: string): Promise<ApiResponse<Booking>> => {
        return apiRequest<Booking>(`/bookings/${id}/cancel`, {
            method: 'POST',
        }, true);
    },

    /**
     * 🎫 Download booking voucher PDF
     */


};

// ============================================
// 🔐 AUTH API - COMPLETE IMPLEMENTATION
// ============================================

export const AuthAPI = {
    /**
     * Login and store token
     */
    login: async (email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> => {
        const response = await apiRequest<{ token: string; user: User }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });

        if (response.success && response.data?.token) {
            TokenManager.set(response.data.token);
        }

        return response;
    },

    /**
     * Register and store token
     */
    register: async (userData: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        country?: string;
    }): Promise<ApiResponse<{ token: string; user: User }>> => {
        const response = await apiRequest<{ token: string; user: User }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });

        if (response.success && response.data?.token) {
            TokenManager.set(response.data.token);
        }

        return response;
    },

    /**
     * Social Login (Google/Facebook)
     */
    socialLogin: async (provider: 'google' | 'facebook', token: string): Promise<ApiResponse<{ token: string; user: User }>> => {
        const endpoint = provider === 'google' ? '/auth/google' : '/auth/facebook';
        const body = provider === 'google' ? { token } : { accessToken: token };

        const response = await apiRequest<{ token: string; user: User }>(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
        if (response.success && response.data) {
            TokenManager.set(response.data.token);
        }
        return response;
    },

    /**
     * Get current user profile (requires auth)
     */
    profile: async (): Promise<ApiResponse<{ user: User & { bookings: Booking[] } }>> => {
        return apiRequest('/auth/profile', {}, true);
    },

    /**
     * Verify current token
     */
    verify: async (): Promise<ApiResponse<{ valid: boolean; user: { userId: string; email: string; role: string } }>> => {
        return apiRequest('/auth/verify', {}, true);
    },

    /**
     * Logout (clear token and cookies)
     */
    logout: async (): Promise<void> => {
        try {
            await apiRequest('/auth/logout', { method: 'POST' });
        } catch (e) {
            console.error('Server logout failed', e);
        }
        TokenManager.remove();
        window.location.href = '/';
    },

    /**
     * Check if user is logged in
     */
    isLoggedIn: (): boolean => {
        return !!TokenManager.get();
    },

    /**
     * Get all users (Admin only)
     */
    getUsers: async (): Promise<ApiResponse<{ users: User[] }>> => {
        return apiRequest('/auth/users', {}, true);
    }
};

// ============================================
// 🌟 REVIEWS API
// ============================================

export const ReviewsAPI = {
    /**
     * Get reviews by hotel ID
     */
    getByHotelId: async (hotelId: string): Promise<ApiResponse<Review[]>> => {
        return apiRequest<Review[]>(`/hotels/${hotelId}/reviews`);
    },

    /**
     * Create a new review
     */
    create: async (reviewData: Partial<Review>): Promise<ApiResponse<Review>> => {
        return apiRequest<Review>('/reviews', {
            method: 'POST',
            body: JSON.stringify(reviewData),
        });
    },

    /**
     * Delete a review
     */
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/reviews/${id}`, {
            method: 'DELETE',
        });
    },
};

// ============================================
// 📊 ADMIN API
// ============================================

// ============================================
// 📊 ADMIN API
// ============================================

export const AdminAPI = {
    /**
     * Get dashboard statistics
     */
    getStats: async (): Promise<ApiResponse<AdminStats>> => {
        return apiRequest<AdminStats>('/admin/stats', {}, true);
    },

    /**
     * Get detailed analytics charts data
     */
    getAnalytics: async (): Promise<ApiResponse<AnalyticsData>> => {
        return apiRequest<AnalyticsData>('/admin/analytics', {}, true);
    },
};

// ============================================
// 🎟️ COUPONS API
// ============================================

export const CouponsAPI = {
    /**
     * Fetch all coupons (Admin only)
     */
    getAll: async (): Promise<ApiResponse<{ coupons: any[] }>> => {
        return apiRequest('/coupons', {}, true);
    },

    /**
     * Create a new coupon (Admin only)
     */
    create: async (couponData: { code: string; discount: number; limit: number }): Promise<ApiResponse<{ coupon: any }>> => {
        return apiRequest('/coupons', {
            method: 'POST',
            body: JSON.stringify(couponData),
        }, true);
    },

    /**
     * Update an existing coupon (Admin only)
     */
    update: async (id: string, couponData: { code?: string; discount?: number; limit?: number; isActive?: boolean }): Promise<ApiResponse<{ coupon: any }>> => {
        return apiRequest(`/coupons/${id}`, {
            method: 'PUT',
            body: JSON.stringify(couponData),
        }, true);
    },

    /**
     * Delete a coupon (Admin only)
     */
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiRequest(`/coupons/${id}`, {
            method: 'DELETE',
        }, true);
    },

    /**
     * Verify a coupon code (Public)
     */
    verify: async (code: string): Promise<ApiResponse<{ valid: boolean; discount: number; code: string; message: string }>> => {
        return apiRequest('/coupons/verify', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    },
};

// Default export for convenience
export default {
    Hotels: HotelsAPI,
    Rooms: RoomsAPI,
    Bookings: BookingsAPI,
    Auth: AuthAPI,
    Reviews: ReviewsAPI,
    Admin: AdminAPI,
    Coupons: CouponsAPI,
};
