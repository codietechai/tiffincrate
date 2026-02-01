# API Cleanup & Optimization Plan

## 🎯 APIs to Remove (Unnecessary/Deprecated)

### 1. Delivery Partner APIs (Remove - Providers deliver themselves)
- `app/api/delivery/assignments/` - ❌ Remove (no separate delivery partners)
- `app/api/delivery/auto-assign/` - ❌ Remove (providers handle own deliveries)
- `app/api/delivery/earnings/` - ❌ Remove (use wallet system instead)
- `app/api/delivery/route-optimization/` - ❌ Remove (handled in frontend navigation)

### 2. Debug APIs (Remove - Not for production)
- `app/api/debug/` - ❌ Remove entire debug folder

### 3. Redundant Address APIs (Combine)
- `app/api/address/default/` - ❌ Remove (combine with main address API)
- `app/api/address/set-default/` - ❌ Remove (combine with PATCH address API)

### 4. Redundant User APIs (Combine)
- `app/api/users/profile/` - ❌ Remove (use auth/me instead)
- `app/api/users/providers/` - ❌ Remove (use providers API instead)

### 5. Separate Analytics APIs (Combine)
- `app/api/analytics/dashboard/` - ✅ Keep but optimize
- `app/api/analytics/delivery/` - ❌ Remove (use provider analytics)
- `app/api/analytics/provider/` - ✅ Keep but optimize

## 🔧 APIs to Fix & Update

### High Priority (Critical)
1. **Auth APIs** - Update for new User schema
2. **Address APIs** - Update for new Address schema  
3. **Orders APIs** - Update for new Order schema
4. **Providers APIs** - Update for new ServiceProvider schema
5. **Menus APIs** - Update for new Menu schema

### Medium Priority (Features)
1. **Wallet APIs** - Already optimized, minor fixes needed
2. **Reviews APIs** - Update for new Review schema
3. **Notifications APIs** - Update for new Notification schema
4. **Help Requests APIs** - Update for new HelpRequest schema

### Low Priority (Admin)
1. **Admin APIs** - Update queries for new schemas
2. **Settings APIs** - Minor updates needed
3. **Analytics APIs** - Update aggregation queries

## 📋 Specific Fixes Needed

### Auth APIs
- Remove `delivery_partner` role support
- Remove unused fields (`address`, `wallet_amount`)
- Add `isVerified` field handling
- Update password exclusion logic

### Address APIs  
- Update field names (remove underscores)
- Convert location to GeoJSON format
- Add new fields (`addressType`, `deliveryInstructions`)
- Combine default address operations

### Orders APIs
- Remove delivery partner references
- Update payment method validation
- Add cancellation tracking
- Fix wallet payment integration

### Providers APIs
- Update location format to GeoJSON
- Add new fields (`businessType`, `serviceRadius`)
- Update operating hours structure
- Add geospatial and text search

### Menus APIs
- Remove `draft` field usage
- Add new fields (`tags`, `preparationTime`)
- Update text search implementation
- Fix menu items relationship

## 🚀 Implementation Order

### Phase 1: Remove Unnecessary APIs
1. Delete debug APIs
2. Delete delivery partner APIs  
3. Delete redundant user APIs
4. Delete redundant address APIs

### Phase 2: Fix Critical APIs
1. Update Auth APIs
2. Update Address APIs
3. Update Orders APIs
4. Update Providers APIs

### Phase 3: Fix Feature APIs
1. Update Menus APIs
2. Update Reviews APIs
3. Update Notifications APIs
4. Update Help Requests APIs

### Phase 4: Fix Admin APIs
1. Update Admin APIs
2. Update Analytics APIs
3. Update Settings APIs