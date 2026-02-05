# Middleware Menu Access Fix

## Issue
Customer users were getting "Provider access required" error when trying to access `/api/menus` from the home page, preventing them from browsing available menus.

**Error**: `{"error":"Provider access required"}` on `GET /api/menus` with status 403 Forbidden

## Root Cause
The middleware was incorrectly categorizing `/api/menus` as a provider-only endpoint, but customers need to be able to view menus to browse and place orders.

## Analysis
The `/api/menus` endpoint supports:
- **GET**: View menus (should be accessible to all authenticated users)
  - Consumers: View available menus with `isActive: true` and `isAvailable: true` filtering
  - Providers: View and manage their own menus with full access
- **POST**: Create menus (correctly restricted to providers only at the API level)

## Solution
Removed `/api/menus` from the `PROVIDER_API_ROUTES` array in middleware, allowing all authenticated users to access it. The API itself handles role-based filtering:

### Before (Incorrect)
```typescript
const PROVIDER_API_ROUTES = [
  "/api/providers/delivery-settings",
  "/api/menus", // ❌ This blocked consumers from viewing menus
];
```

### After (Fixed)
```typescript
const PROVIDER_API_ROUTES = [
  "/api/providers/delivery-settings",
  // Note: /api/menus is accessible to all roles - consumers can view, providers can manage
];
```

## API-Level Security
The `/api/menus` endpoint properly handles role-based access:

1. **Consumer Access (GET)**:
   - Automatically filters to `isActive: true` and `isAvailable: true`
   - Can filter by specific provider using `providerId` parameter
   - Cannot create or modify menus

2. **Provider Access (GET/POST)**:
   - GET: Automatically filters to their own menus using their provider ID
   - POST: Can create new menus (with proper validation)
   - Full access to their own menu management

3. **Admin Access**:
   - Full access to all menus across all providers

## Files Modified
- `middleware.ts`: Removed `/api/menus` from provider-only routes
- Added clarifying comments about role-based filtering

## Testing
- ✅ Consumers can now access `/api/menus` to browse available menus
- ✅ Providers can still manage their own menus
- ✅ API-level filtering works correctly for each role
- ✅ POST operations still restricted to providers only

## Impact
- Fixed customer home page loading issues
- Customers can now browse menus and place orders
- Maintained security by keeping role-based filtering at the API level
- No impact on provider functionality

This fix ensures that the middleware focuses on broad access control while allowing APIs to handle fine-grained role-based filtering and business logic.