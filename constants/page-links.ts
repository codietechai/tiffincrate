/**
 * Page Links Constants
 * Centralized frontend route definitions for consistent navigation across the application
 * Updated to reflect the cleaned folder structure
 */

export const PAGE_LINKS = {
    // Root & Landing
    ROOT: "/",
    LANDING: "/",

    // Authentication
    AUTH: {
        LOGIN: "/auth/login",
        REGISTER: "/auth/register",
    },

    // Main App Pages
    HOME: "/home",

    // Address Management
    ADDRESS: {
        LIST: "/address",
        ADD: "/address/add",
        EDIT: (id: string) => `/address/edit/${id}`,
    },

    // Provider & Menu Discovery
    BROWSE_PROVIDERS: "/browse-providers",
    PROVIDER: {
        DETAIL: (id: string) => `/provider/${id}`,
        LEGACY_DETAIL: (id: string) => `/providers/${id}`, // Keep for backward compatibility
    },

    // Menu & Cart
    MENU_ITEM: {
        DETAIL: (id: string) => `/menu-item/${id}`,
    },
    CART: "/cart",

    // Orders
    ORDER: {
        HISTORY: "/order-history",
        DETAIL: (id: string) => `/order-detail/${id}`,
        TRACK: (id: string) => `/track-order/${id}`,
        TRACK_LIST: "/track-orders",
    },

    // User Features
    PROFILE: "/profile",
    SETTINGS: "/settings",
    FAVORITES: "/favorites",
    NOTIFICATIONS: "/notifications",
    REVIEWS: "/reviews",
    HELP_REQUESTS: "/help-requests",

    // Provider Screens (moved from nested structure)
    PROVIDER_SCREENS: {
        MENU: "/menu",
        ORDERS: "/orders",
        ANALYTICS: "/analytics",
    },

    // Analytics
    ANALYTICS: "/analytics",
    ANALYTICS_REPORT: "/analytics/report",

    // Provider Order Management
    PROVIDER_ORDERS: "/provider-orders",
    PROVIDER_DELIVERY_ORDERS: "/provider-delivery-orders",
    PROVIDER_ORDER_DETAIL: (id: string) => `/provider-order-detail/${id}`,

    // Dashboard (Management Interfaces)
    DASHBOARD: {
        // Delivery Dashboard
        DELIVERY: "/dashboard/delivery",

        // Provider Dashboard
        PROVIDER: {
            BASE: "/dashboard/provider",
            DELIVERY_SETTINGS: "/dashboard/provider/delivery-settings",
        },
    },

    // Admin Screens
    ADMIN: {
        CRON: "/admin/cron",
    },

    // Utility Pages
    MAP_SELECTOR: "/map-selector",
} as const;

// Navigation helpers for role-based routing
export const ROLE_BASED_LINKS = {
    CONSUMER: {
        HOME: PAGE_LINKS.HOME,
        BROWSE_PROVIDERS: PAGE_LINKS.BROWSE_PROVIDERS,
        ORDER_HISTORY: PAGE_LINKS.ORDER.HISTORY,
        FAVORITES: PAGE_LINKS.FAVORITES,
        PROFILE: PAGE_LINKS.PROFILE,
        CART: PAGE_LINKS.CART,
        SETTINGS: PAGE_LINKS.SETTINGS,
        NOTIFICATIONS: PAGE_LINKS.NOTIFICATIONS,
        HELP_REQUESTS: PAGE_LINKS.HELP_REQUESTS,
    },
    PROVIDER: {
        HOME: PAGE_LINKS.HOME,
        MENU: PAGE_LINKS.PROVIDER_SCREENS.MENU,
        ORDERS: PAGE_LINKS.PROVIDER_SCREENS.ORDERS,
        ANALYTICS: PAGE_LINKS.PROVIDER_SCREENS.ANALYTICS,
        DELIVERY: PAGE_LINKS.DASHBOARD.DELIVERY,
        PROFILE: PAGE_LINKS.PROFILE,
        SETTINGS: PAGE_LINKS.SETTINGS,
        NOTIFICATIONS: PAGE_LINKS.NOTIFICATIONS,
        HELP_REQUESTS: PAGE_LINKS.HELP_REQUESTS,
        // Order Management
        PROVIDER_ORDERS: PAGE_LINKS.PROVIDER_ORDERS,
        PROVIDER_DELIVERY_ORDERS: PAGE_LINKS.PROVIDER_DELIVERY_ORDERS,
        PROVIDER_ORDER_DETAIL: PAGE_LINKS.PROVIDER_ORDER_DETAIL,
    },
    ADMIN: {
        HOME: PAGE_LINKS.HOME,
        CRON: PAGE_LINKS.ADMIN.CRON,
        SETTINGS: PAGE_LINKS.SETTINGS,
        NOTIFICATIONS: PAGE_LINKS.NOTIFICATIONS,
        HELP_REQUESTS: PAGE_LINKS.HELP_REQUESTS,
    },
} as const;

// Footer navigation configurations
export const FOOTER_NAVIGATION = {
    CONSUMER: [
        { id: "home", label: "Home", href: PAGE_LINKS.HOME },
        { id: "browse-providers", label: "Providers", href: PAGE_LINKS.BROWSE_PROVIDERS },
        { id: "orders", label: "Orders", href: PAGE_LINKS.ORDER.HISTORY },
        { id: "favorites", label: "Favorites", href: PAGE_LINKS.FAVORITES },
        { id: "profile", label: "Profile", href: PAGE_LINKS.PROFILE },
    ],
    PROVIDER: [
        { id: "home", label: "Home", href: PAGE_LINKS.HOME },
        { id: "menu", label: "Menu", href: PAGE_LINKS.PROVIDER_SCREENS.MENU },
        { id: "orders", label: "Orders", href: PAGE_LINKS.PROVIDER_SCREENS.ORDERS },
        { id: "delivery", label: "Delivery", href: PAGE_LINKS.DASHBOARD.DELIVERY },
        { id: "profile", label: "Profile", href: PAGE_LINKS.PROFILE },
    ],
    ADMIN: [
        { id: "home", label: "Home", href: PAGE_LINKS.HOME },
        { id: "cron", label: "Cron", href: PAGE_LINKS.ADMIN.CRON },
        { id: "settings", label: "Settings", href: PAGE_LINKS.SETTINGS },
        { id: "help", label: "Help", href: PAGE_LINKS.HELP_REQUESTS },
        { id: "profile", label: "Profile", href: PAGE_LINKS.PROFILE },
    ],
} as const;

// Provider home navigation menu
export const PROVIDER_HOME_NAVIGATION = [
    { id: "orders", label: "Orders", href: '/' }, // Local tab
    { id: "menu", label: "Menu", href: PAGE_LINKS.PROVIDER_SCREENS.MENU },
    { id: "delivery", label: "Delivery Map", href: PAGE_LINKS.DASHBOARD.DELIVERY },
    { id: "analytics", label: "Analytics", href: PAGE_LINKS.PROVIDER_SCREENS.ANALYTICS },
    { id: "settings", label: "Settings", href: PAGE_LINKS.SETTINGS },
    { id: "help", label: "Help", href: PAGE_LINKS.HELP_REQUESTS },
] as const;

// Provider order management navigation
export const PROVIDER_ORDER_NAVIGATION = [
    { id: "all-orders", label: "All Orders", href: PAGE_LINKS.PROVIDER_ORDERS },
    { id: "today-deliveries", label: "Today's Deliveries", href: PAGE_LINKS.PROVIDER_DELIVERY_ORDERS },
] as const;

// Settings navigation links
export const SETTINGS_NAVIGATION = [
    { key: "profile", label: "Profile", path: PAGE_LINKS.PROFILE },
    { key: "help", label: "Help Requests", path: PAGE_LINKS.HELP_REQUESTS },
    { key: "reviews", label: "Reviews", path: PAGE_LINKS.REVIEWS },
    { key: "notifications", label: "Alerts & Updates", path: PAGE_LINKS.NOTIFICATIONS },
] as const;

// Helper function to build dynamic links
export const buildLink = (template: (id: string) => string, id: string): string => {
    return template(id);
};

// Type for page link values
export type PageLink = typeof PAGE_LINKS[keyof typeof PAGE_LINKS];
export type RoleBasedLinks = typeof ROLE_BASED_LINKS[keyof typeof ROLE_BASED_LINKS];
export type FooterNavigation = typeof FOOTER_NAVIGATION[keyof typeof FOOTER_NAVIGATION];