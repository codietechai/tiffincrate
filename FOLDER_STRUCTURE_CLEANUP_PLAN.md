# Folder Structure Cleanup Plan

## Current Issues Identified

### 1. Duplicate Dashboard Structures
- `app/(screens)/dashboard/` - Old dashboard pages
- `app/dashboard/` - New dashboard pages
- **Action**: Keep `app/dashboard/` and remove `app/(screens)/dashboard/`

### 2. Confusing "new-" Naming
- `app/(screens)/new-cart/` → Should be `app/(screens)/cart/`
- `app/(screens)/new-menu-item/[id]/` → Should be `app/(screens)/menu-item/[id]/`
- `app/(screens)/new-provider/[id]/` → Should be `app/(screens)/provider/[id]/`

### 3. Duplicate Order Pages
- `app/(screens)/order-history/` - Customer order history
- `app/(screens)/orders/` - Provider orders (newly moved)
- **Action**: Keep both but clarify naming

### 4. Unnecessary Nesting
- `app/(screens)/(provider-screens)/` - ✅ Already removed
- Some pages could be moved to root level

### 5. Delivery Structure Confusion
- `app/delivery/earnings/` - Should be in dashboard
- `app/dashboard/delivery/` - Correct location

## Cleanup Actions

### Phase 1: Remove Duplicate Dashboards ✅
- Delete `app/(screens)/dashboard/` entirely
- Keep `app/dashboard/` for delivery and provider-specific dashboards

### Phase 2: Rename "new-" Pages ✅
- `new-cart` → `cart`
- `new-menu-item` → `menu-item`  
- `new-provider` → `provider`

### Phase 3: Consolidate Delivery Pages ✅
- Move `app/delivery/earnings/` to `app/dashboard/delivery/earnings/`
- Keep delivery-related pages under dashboard

### Phase 4: Clean Up Unnecessary Pages ✅
- Remove unused test pages
- Remove duplicate functionality

## Final Structure

```
app/
├── (screens)/
│   ├── address/
│   ├── analytics/          # Provider analytics (moved from nested)
│   ├── browse-providers/
│   ├── cart/              # Renamed from new-cart
│   ├── favorites/
│   ├── help-requests/
│   ├── home/              # Role-based home (consumer/provider/admin)
│   ├── menu/              # Provider menu management (moved from nested)
│   ├── menu-item/[id]/    # Renamed from new-menu-item
│   ├── notifications/
│   ├── order-detail/[id]/
│   ├── order-history/     # Customer order history
│   ├── orders/            # Provider orders (moved from nested)
│   ├── profile/
│   ├── provider/[id]/     # Renamed from new-provider
│   ├── reviews/
│   ├── settings/
│   ├── track-order/[id]/
│   └── track-orders/
├── api/                   # All API routes (keep as is)
├── auth/
│   ├── login/
│   └── register/
├── dashboard/
│   ├── delivery/
│   │   ├── earnings/      # Moved from app/delivery/earnings/
│   │   └── page.tsx       # Main delivery map
│   └── provider/
│       └── delivery-settings/
├── map-selector/
├── globals.css
├── layout.tsx
├── page.tsx               # Landing page
└── provider.tsx           # React Query provider
```

## Benefits of This Structure

1. **Clear Separation**: 
   - `(screens)/` for user-facing pages
   - `dashboard/` for management interfaces
   - `api/` for backend endpoints

2. **Intuitive Naming**:
   - No confusing "new-" prefixes
   - Clear role-based organization

3. **No Duplication**:
   - Single source of truth for each feature
   - No conflicting routes

4. **Scalable**:
   - Easy to add new features
   - Clear patterns to follow