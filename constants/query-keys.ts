// Query Keys for React Query
export const QUERY_KEYS = {
    // Authentication
    AUTH: {
        ME: ['auth', 'me'] as const,
        CHECK: ['auth', 'check'] as const,
    },

    // Address
    ADDRESS: {
        ALL: ['address', 'all'] as const,
        BY_ID: (id: string) => ['address', 'by-id', id] as const,
        DEFAULT: ['address', 'default'] as const,
    },

    // Menu
    MENU: {
        ALL: ['menu', 'all'] as const,
        INFINITE: ['menu', 'infinite'] as const,
        BY_PROVIDER: (providerId: string) => ['menu', 'by-provider', providerId] as const,
        BY_ID: (id: string) => ['menu', 'by-id', id] as const,
        ITEMS: (menuId: string) => ['menu', 'items', menuId] as const,
        ITEM_BY_ID: (menuId: string, itemId: string) => ['menu', 'items', menuId, itemId] as const,
    },

    // Order
    ORDER: {
        ALL: ['order', 'all'] as const,
        BY_ID: (id: string) => ['order', 'by-id', id] as const,
        BY_USER: (userId: string) => ['order', 'by-user', userId] as const,
        BY_PROVIDER: (providerId: string) => ['order', 'by-provider', providerId] as const,
        TODAY: ['order', 'today'] as const,
        HISTORY: ['order', 'history'] as const,
        TRACK: (id: string) => ['order', 'track', id] as const,
        LIVE_UPDATES: ['order', 'live-updates'] as const,
    },

    // Provider
    PROVIDER: {
        ALL: ['provider', 'all'] as const,
        BY_ID: (id: string) => ['provider', 'by-id', id] as const,
        BY_AREA: (area: string) => ['provider', 'by-area', area] as const,
        BY_CUISINE: (cuisine: string) => ['provider', 'by-cuisine', cuisine] as const,
        DELIVERY_SETTINGS: (providerId: string) => ['provider', 'delivery-settings', providerId] as const,
        NEARBY: (lat: number, lng: number, radius?: number) => ['provider', 'nearby', lat, lng, radius] as const,
    },

    // Delivery Orders
    DELIVERY_ORDER: {
        ALL: ['delivery-order', 'all'] as const,
        UPCOMING: ['delivery-order', 'upcoming'] as const,
        BY_PROVIDER: (providerId: string) => ['delivery-order', 'by-provider', providerId] as const,
        BY_DATE: (date: string) => ['delivery-order', 'by-date', date] as const,
        TODAY: ['delivery-order', 'today'] as const,
    },

    // Notification
    NOTIFICATION: {
        ALL: ['notification', 'all'] as const,
        UNREAD: ['notification', 'unread'] as const,
        BY_USER: (userId: string) => ['notification', 'by-user', userId] as const,
        LIVE: ['notification', 'live'] as const,
    },

    // Review
    REVIEW: {
        ALL: ['review', 'all'] as const,
        BY_PROVIDER: (providerId: string) => ['review', 'by-provider', providerId] as const,
        BY_USER: (userId: string) => ['review', 'by-user', userId] as const,
        BY_ORDER: (orderId: string) => ['review', 'by-order', orderId] as const,
    },

    // Help Request
    HELP_REQUEST: {
        ALL: ['help-request', 'all'] as const,
        BY_ID: (id: string) => ['help-request', 'by-id', id] as const,
        BY_USER: (userId: string) => ['help-request', 'by-user', userId] as const,
        CUSTOMER_PROVIDERS: ['help-request', 'customer-providers'] as const,
    },

    // Wallet
    WALLET: {
        BALANCE: ['wallet', 'balance'] as const,
        TRANSACTIONS: (params?: { page?: number; limit?: number; category?: string }) =>
            ['wallet', 'transactions', params] as const,
        WITHDRAWAL_REQUESTS: ['wallet', 'withdrawal-requests'] as const,
    },

    // Settings
    SETTINGS: {
        USER: (userId: string) => ['settings', 'user', userId] as const,
        PROVIDER: (providerId: string) => ['settings', 'provider', providerId] as const,
        SYSTEM: ['settings', 'system'] as const,
    },

    // Analytics
    ANALYTICS: {
        DASHBOARD: ['analytics', 'dashboard'] as const,
        PROVIDER: (providerId: string) => ['analytics', 'provider', providerId] as const,
        ORDERS: (period: string) => ['analytics', 'orders', period] as const,
        REVENUE: (period: string) => ['analytics', 'revenue', period] as const,
    },

    // Admin
    ADMIN: {
        ORDERS: ['admin', 'orders'] as const,
        ORDER_BY_ID: (id: string) => ['admin', 'orders', id] as const,
        PROVIDERS: ['admin', 'providers'] as const,
        PROVIDER_BY_ID: (id: string) => ['admin', 'providers', id] as const,
        USERS: ['admin', 'users'] as const,
        USER_BY_ID: (id: string) => ['admin', 'users', id] as const,
        REPORTS: ['admin', 'reports'] as const,
        REVIEWS: ['admin', 'reviews'] as const,
    },

    // Favorites
    FAVORITES: {
        BY_USER: (userId: string) => ['favorites', 'by-user', userId] as const,
    },

    // Cron Jobs
    CRON: {
        STATUS: ['cron', 'status'] as const,
        JOBS: ['cron', 'jobs'] as const,
    },

    // Development/Testing
    SEED: {
        STATUS: ['seed', 'status'] as const,
    },
} as const;

// Helper function to invalidate related queries
export const getRelatedQueryKeys = (entity: string, id?: string) => {
    switch (entity) {
        case 'order':
            return [
                QUERY_KEYS.ORDER.ALL,
                QUERY_KEYS.ORDER.TODAY,
                QUERY_KEYS.ORDER.HISTORY,
                QUERY_KEYS.DELIVERY_ORDER.ALL,
                QUERY_KEYS.DELIVERY_ORDER.UPCOMING,
                ...(id ? [QUERY_KEYS.ORDER.BY_ID(id)] : []),
            ];

        case 'address':
            return [
                QUERY_KEYS.ADDRESS.ALL,
                QUERY_KEYS.ADDRESS.DEFAULT,
                ...(id ? [QUERY_KEYS.ADDRESS.BY_ID(id)] : []),
            ];

        case 'menu':
            return [
                QUERY_KEYS.MENU.ALL,
                ...(id ? [QUERY_KEYS.MENU.BY_ID(id)] : []),
            ];

        case 'provider':
            return [
                QUERY_KEYS.PROVIDER.ALL,
                ...(id ? [QUERY_KEYS.PROVIDER.BY_ID(id)] : []),
            ];

        case 'notification':
            return [
                QUERY_KEYS.NOTIFICATION.ALL,
                QUERY_KEYS.NOTIFICATION.UNREAD,
            ];

        default:
            return [];
    }
};