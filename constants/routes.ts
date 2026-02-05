// Re-export from the new centralized files for backward compatibility
export { API_ROUTES as ROUTES, buildApiUrl, buildQueryParams } from './api-routes';
export { PAGE_LINKS as FRONTEND_ROUTES, ROLE_BASED_LINKS, FOOTER_NAVIGATION } from './page-links';

// Legacy exports (deprecated - use API_ROUTES and PAGE_LINKS instead)
export { API_ROUTES } from './api-routes';
export { PAGE_LINKS } from './page-links';