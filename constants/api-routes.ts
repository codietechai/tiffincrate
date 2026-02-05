/**
 * API Routes Constants
 * Centralized API endpoint definitions for consistent usage across the application
 */

export const API_ROUTES = {
    // Authentication Routes
    AUTH: {
        LOGIN: "/api/auth/login",
        REGISTER: "/api/auth/register",
        ME: "/api/auth/me",
        LOGOUT: "/api/auth/logout",
        LOGOUT_ALL: "/api/auth/logout-all",
        DELETE_ACCOUNT: "/api/auth/delete-account",
    },

    // Address Routes
    ADDRESS: {
        BASE: "/api/address",
        BY_ID: (id: string) => `/api/address/${id}`,
    },

    // Menu Routes
    MENU: {
        BASE: "/api/menus",
        BY_ID: (id: string) => `/api/menus/${id}`,
        ITEMS: (menuId: string) => `/api/menus/${menuId}/items`,
        ITEM_BY_ID: (menuId: string, itemId: string) => `/api/menus/${menuId}/items/${itemId}`,
    },

    // Order Routes
    ORDER: {
        BASE: "/api/orders",
        BY_ID: (id: string) => `/api/orders/${id}`,
        STATUS: (id: string) => `/api/orders/${id}/status`,
        TRACK: (id: string) => `/api/orders/track/${id}`,
        TODAY: "/api/orders/today",
        BULK_STATUS: "/api/orders/bulk-status",
        CALCULATE_ETA: "/api/orders/calculate-eta",
        LIVE_UPDATES: "/api/orders/live-updates",
        MIGRATE_PROVIDER_ID: "/api/orders/migrate-provider-id",
    },

    // Provider Routes
    PROVIDER: {
        BASE: "/api/providers",
        BY_ID: (id: string) => `/api/providers/${id}`,
        DELIVERY_SETTINGS: "/api/providers/delivery-settings",
    },

    // Delivery Orders Routes
    DELIVERY_ORDER: {
        BASE: "/api/delivery-orders",
        UPCOMING: "/api/delivery-orders/upcoming",
    },

    // Notification Routes
    NOTIFICATION: {
        BASE: "/api/notifications",
        LIVE: "/api/notifications/live",
    },

    // Review Routes
    REVIEW: {
        BASE: "/api/reviews",
    },

    // Help Request Routes
    HELP_REQUEST: {
        BASE: "/api/help-requests",
        BY_ID: (id: string) => `/api/help-requests/${id}`,
        CUSTOMER_PROVIDERS: "/api/help-requests/customer-providers",
    },

    // Wallet Routes
    WALLET: {
        BASE: "/api/wallet",
        ADD_MONEY: "/api/wallet/add-money",
        FREEZE: "/api/wallet/freeze",
        TRANSACTIONS: "/api/wallet/transactions",
        WITHDRAWAL: "/api/wallet/withdrawal",
        WITHDRAWAL_BY_ID: (requestId: string) => `/api/wallet/withdrawal/${requestId}`,
    },

    // Settings Routes
    SETTINGS: {
        BASE: "/api/settings",
        USER: (userId: string) => `/api/settings/user/${userId}`,
        PROVIDER: (providerId: string) => `/api/settings/provider/${providerId}`,
        SYSTEM: "/api/settings/system",
    },

    // Analytics Routes
    ANALYTICS: {
        DASHBOARD: "/api/analytics/dashboard",
        PROVIDER: "/api/analytics/provider",
        DIGEST: {
            WEEKLY: "/api/analytics/digest/weekly",
            MONTHLY: "/api/analytics/digest/monthly",
        },
    },

    // Admin Routes
    ADMIN: {
        ORDERS: "/api/admin/orders",
        ORDER_BY_ID: (id: string) => `/api/admin/orders/${id}`,
        ORDER_STATUS: (id: string) => `/api/admin/orders/${id}/status`,
        PROVIDERS: "/api/admin/providers",
        PROVIDER_BY_ID: (id: string) => `/api/admin/providers/${id}`,
        PROVIDER_VERIFY: (id: string) => `/api/admin/providers/${id}/verify`,
        REPORTS: "/api/admin/reports",
        REVIEWS: "/api/admin/reviews",
        USERS: "/api/admin/users",
        USER_BY_ID: (id: string) => `/api/admin/users/${id}`,
    },

    // Favorites Routes
    FAVORITES: {
        BASE: "/api/favorites",
    },

    // Razorpay Routes
    RAZORPAY: {
        CREATE_ORDER: "/api/razorpay/create-order",
    },

    // Reverse Geocode Routes
    REVERSE_GEOCODE: "/api/reverse-geocode",

    // Cron Routes
    CRON: {
        CHECK_EXPIRED_ORDERS: "/api/cron/check-expired-orders",
        START_SCHEDULER: "/api/cron/start-scheduler",
    },

    // Seed Routes (for development/testing)
    SEED: {
        PROVIDERS: "/api/seed/providers",
        MENUS: "/api/seed/menus",
        DELIVERY_ORDERS: "/api/seed/delivery-orders",
        ALL: "/api/seed/all",
    },

    // Test Routes (for development/testing)
    TEST: {
        CRON: "/api/test-cron",
        MENU_SEEDING: "/api/test/menu-seeding",
        SEED_STATUS: "/api/test/seed-status",
    },
} as const;

// Query parameter builders
export const buildQueryParams = (params: Record<string, string | number | boolean | undefined>): string => {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
};

// Helper function to build URLs with query parameters
export const buildApiUrl = (route: string, params?: Record<string, string | number | boolean | undefined>): string => {
    if (!params) return route;
    return `${route}${buildQueryParams(params)}`;
};

// Type for API route values
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES];