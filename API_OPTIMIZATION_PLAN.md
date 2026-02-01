# API Optimization Plan

## 🎯 Overview

This document outlines the API updates required to work with the optimized database schemas. All APIs need to be updated to handle the new field names, data structures, and indexes.

## 📊 Schema Changes Impact

### 1. User API Changes
**Schema Changes:**
- Removed `delivery_partner` role
- Removed `address`, `settings`, `wallet_amount` fields
- Added `isVerified`, `lastLoginAt` fields
- Password field excluded from queries by default

**API Updates Required:**
- `GET /api/auth/me` - Update response structure
- `POST /api/auth/register` - Remove unused fields validation
- `GET /api/admin/users` - Update query and response

### 2. ServiceProvider API Changes
**Schema Changes:**
- Location changed from `{latitude, longitude}` to GeoJSON Point
- Added `businessType`, `serviceRadius`, `avgDeliveryTime`
- Changed `operatingHours` structure
- Added geospatial and text search indexes

**API Updates Required:**
- `GET /api/providers` - Update location queries and response format
- `POST /api/providers` - Update location data handling
- `PUT /api/providers/[id]` - Update location and new fields

### 3. Address API Changes
**Schema Changes:**
- Field names changed (removed underscores)
- Location changed to GeoJSON Point
- Added `addressType`, `deliveryInstructions`, `landmark`
- Removed country_code, dial_code fields

**API Updates Required:**
- `GET /api/address` - Update response structure
- `POST /api/address` - Update field validation
- `PUT /api/address/[id]` - Update field handling

### 4. Order API Changes
**Schema Changes:**
- Removed delivery partner references
- Added cancellation tracking fields
- Improved payment method enum
- Added proper item validation

**API Updates Required:**
- `POST /api/orders` - Update validation and creation logic
- `GET /api/orders` - Update response structure
- `PATCH /api/orders/[id]/status` - Update status handling

### 5. Menu API Changes
**Schema Changes:**
- Removed `draft` field
- Added `tags`, `preparationTime`, `servingSize`
- Added text search capabilities

**API Updates Required:**
- `GET /api/menus` - Update search and response
- `POST /api/menus` - Add new field validation
- `PUT /api/menus/[id]` - Update field handling

### 6. DeliveryOrder API Changes
**Schema Changes:**
- Complete restructure with proper references
- Added settlement tracking
- Improved status management

**API Updates Required:**
- `GET /api/delivery-orders` - Update queries and response
- `PATCH /api/delivery-orders/[id]` - Update status handling

## 🔧 Priority Updates

### High Priority (Critical for functionality)
1. **Address APIs** - Location format changes
2. **Provider APIs** - Location and operating hours changes
3. **Order APIs** - Payment method and status changes
4. **User APIs** - Role and field changes

### Medium Priority (Feature enhancements)
1. **Menu APIs** - Search and new fields
2. **Review APIs** - New fields and moderation
3. **Notification APIs** - Priority and expiration
4. **Help Request APIs** - Assignment and tags

### Low Priority (Performance improvements)
1. **Search APIs** - Text search optimization
2. **Location APIs** - Geospatial query optimization
3. **Analytics APIs** - New aggregation queries

## 📝 API Update Checklist

### For Each API Endpoint:
- [ ] Update input validation schemas
- [ ] Update database queries to use new field names
- [ ] Update response formatting
- [ ] Add new field handling
- [ ] Remove deprecated field handling
- [ ] Update error messages
- [ ] Test with new data structure

### Specific Updates Needed:

#### 1. Location Data Handling
```javascript
// Old format
{ latitude: 19.0760, longitude: 72.8777 }

// New format
{
  type: "Point",
  coordinates: [72.8777, 19.0760] // [lng, lat]
}
```

#### 2. Address Field Mapping
```javascript
// Old fields → New fields
user_id → userId
address_line_1 → addressLine1
address_line_2 → addressLine2
region → state
postal_code → pincode
is_default → isDefault
```

#### 3. Provider Operating Hours
```javascript
// Old format
{ start: "9:00", end: "21:00" }

// New format
{
  breakfast: { enabled: true, selfDelivery: true },
  lunch: { enabled: true, selfDelivery: true },
  dinner: { enabled: true, selfDelivery: true }
}
```

## 🚀 Implementation Strategy

### Phase 1: Critical APIs (Week 1)
1. Update User authentication APIs
2. Update Address management APIs
3. Update Provider registration APIs
4. Update Order creation APIs

### Phase 2: Feature APIs (Week 2)
1. Update Menu management APIs
2. Update Review system APIs
3. Update Notification APIs
4. Update Help Request APIs

### Phase 3: Optimization (Week 3)
1. Implement geospatial queries
2. Implement text search
3. Optimize aggregation queries
4. Add performance monitoring

### Phase 4: Testing & Validation (Week 4)
1. Comprehensive API testing
2. Data migration validation
3. Performance testing
4. Frontend integration testing

## 🔍 Testing Strategy

### Unit Tests
- Test each API endpoint with new data structure
- Test validation with new field requirements
- Test error handling with invalid data

### Integration Tests
- Test complete user workflows
- Test data consistency across APIs
- Test geospatial and search functionality

### Performance Tests
- Test query performance with new indexes
- Test API response times
- Test concurrent user scenarios

## 📊 Migration Considerations

### Database Migration
1. **Backup existing data**
2. **Run field mapping scripts**
3. **Create new indexes**
4. **Validate data integrity**
5. **Update API endpoints**
6. **Test thoroughly**

### Frontend Updates
1. **Update API client calls**
2. **Update data models**
3. **Update form validations**
4. **Update display components**
5. **Test user workflows**

This comprehensive plan ensures all APIs are properly updated to work with the optimized schemas while maintaining data integrity and improving performance.