# Delivery System Testing Guide

## Overview 🎯
This guide provides step-by-step instructions for testing the complete delivery system including the map interface, cron jobs, navigation restrictions, and delivery order management.

## Prerequisites ✅

### **1. Server Setup**
```bash
# Ensure development server is running
npm run dev
# Server should be available at http://localhost:3000
```

### **2. Database Requirements**
- MongoDB connection established
- Basic seed data (users, providers, addresses, menus)
- Admin user account for accessing admin features

### **3. Environment Variables**
```env
MONGODB_URI=mongodb://localhost:27017/
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
CRON_SECRET=dev-cron-secret-2024
```

## Testing Scenarios 🧪

### **Phase 1: Seed Test Data**

#### **Step 1.1: Create Test Delivery Orders**
```bash
# Create sample delivery orders for testing
POST http://localhost:3000/api/seed/delivery-orders

# Expected Response:
{
  "success": true,
  "message": "Delivery orders seeded successfully",
  "data": {
    "totalDeliveryOrders": 16,
    "breakdown": {
      "breakfast": 6,
      "lunch": 5,
      "dinner": 5
    }
  }
}
```

#### **Step 1.2: Verify Data Creation**
- Check that delivery orders were created in database
- Verify different time slots and statuses
- Confirm expired breakfast orders exist for cron testing

### **Phase 2: Navigation Time Restrictions**

#### **Step 2.1: Test Current Time Validation**
Navigate to: `http://localhost:3000/dashboard/delivery`

**Expected Behavior Based on Current Time:**

**If Current Time is 5:00 PM:**
- ✅ **Breakfast**: Button shows "Available tomorrow at 6:30am"
- ✅ **Lunch**: Button shows "Available tomorrow at 11:30am"  
- ✅ **Dinner**: Button shows "Available in 1h 30m"

**If Current Time is 11:45 AM:**
- ❌ **Breakfast**: Button shows "Available tomorrow at 6:30am" (expired)
- ✅ **Lunch**: Button shows "Start Delivery Route" (available)
- ❌ **Dinner**: Button shows "Available in 7h 45m" (too early)

#### **Step 2.2: Test Time Slot Selector**
1. Click on time slot dropdown
2. Verify badges show correct status:
   - **Green "Active"**: Current time slot
   - **Blue "Ready"**: Navigation available
   - **Gray with time**: Time until available

#### **Step 2.3: Test Navigation Prevention**
1. Try to start navigation for expired time slot
2. Verify error message appears
3. Confirm button remains disabled

### **Phase 3: Delivery Order Status Display**

#### **Step 3.1: Verify Correct Status Display**
1. Navigate to delivery dashboard
2. Select different time slots
3. Verify orders show **delivery status** not order status:
   - pending, confirmed, preparing, ready, out_for_delivery, delivered, not_delivered

#### **Step 3.2: Test Status Updates**
1. Start navigation (if time allows)
2. Verify orders change to "out_for_delivery"
3. Test individual order status updates
4. Confirm status changes reflect immediately

#### **Step 3.3: Test Order Details**
1. Click on individual orders in sidebar
2. Verify order details dialog shows:
   - Delivery-specific information
   - Correct address fields
   - Proper status badges
   - Delivery timestamps

### **Phase 4: Map Functionality**

#### **Step 4.1: Test Map Loading**
1. Verify Google Maps loads properly
2. Check that order markers appear on map
3. Confirm markers show order numbers
4. Test marker click functionality

#### **Step 4.2: Test Navigation Features**
**If navigation is available for current time:**
1. Click "Start Delivery Route"
2. Verify GPS tracking starts (allow location access)
3. Test route calculation and display
4. Check real-time location updates

#### **Step 4.3: Test Order Management**
1. Click on order markers
2. Test "Navigate Here" functionality
3. Test phone call functionality
4. Test order completion when near customer

### **Phase 5: Cron Job System**

#### **Step 5.1: Access Cron Admin Interface**
Navigate to: `http://localhost:3000/admin/cron`
(Requires admin login)

#### **Step 5.2: Test Manual Cron Execution**
1. Click "Run Manual Check"
2. Verify results show:
   - Processed orders count
   - Expired orders count
   - Timestamp of execution

#### **Step 5.3: Test Automated Scheduler**
1. Set interval to 1 minute for testing
2. Click "Start Scheduler"
3. Keep browser tab open
4. Monitor results updating every minute

#### **Step 5.4: Verify Expired Order Handling**
1. Check that breakfast orders (if expired) are marked as "not_delivered"
2. Verify timestamps are set correctly
3. Confirm cancel reason is populated

### **Phase 6: Real-Time Updates**

#### **Step 6.1: Test Live Order Updates**
1. Open delivery dashboard in one browser tab
2. Update order status via API in another tab/tool
3. Verify changes appear in real-time (within 30 seconds)

#### **Step 6.2: Test Server-Sent Events**
1. Monitor browser network tab for SSE connection
2. Verify "Live" indicator shows green
3. Test reconnection when connection drops

## API Testing Endpoints 🔧

### **Direct API Tests**

#### **1. Get Today's Delivery Orders**
```bash
GET http://localhost:3000/api/orders/today?timeSlot=lunch
Headers: 
  x-user-id: [provider-user-id]
  x-user-role: provider
```

#### **2. Update Delivery Order Status**
```bash
PATCH http://localhost:3000/api/orders/[delivery-order-id]/status
Headers:
  x-user-id: [provider-user-id]
  x-user-role: provider
Body: { "status": "delivered" }
```

#### **3. Bulk Status Update**
```bash
PATCH http://localhost:3000/api/orders/bulk-status
Headers:
  x-user-id: [provider-user-id]
  x-user-role: provider
Body: { 
  "status": "out_for_delivery", 
  "orderIds": ["id1", "id2", "id3"] 
}
```

#### **4. Manual Cron Execution**
```bash
GET http://localhost:3000/api/cron/check-expired-orders?test=true
```

## Expected Results ✅

### **Navigation Time Restrictions**
- ✅ Can only start navigation during valid time windows
- ✅ Clear error messages for invalid attempts
- ✅ Accurate countdown timers
- ✅ Proper time slot validation

### **Delivery Order Management**
- ✅ Shows delivery status, not order status
- ✅ Real-time status updates
- ✅ Proper timestamp tracking
- ✅ Correct data population

### **Map Integration**
- ✅ Google Maps loads with markers
- ✅ GPS tracking works (with permission)
- ✅ Route calculation and display
- ✅ Order management within map

### **Cron Job System**
- ✅ Expired orders marked as "not_delivered"
- ✅ Proper timestamp and reason tracking
- ✅ Scheduler runs automatically
- ✅ Admin interface works correctly

## Troubleshooting 🔧

### **Common Issues**

#### **1. Map Not Loading**
- Check Google Maps API key in `.env`
- Verify API key has required permissions
- Check browser console for errors

#### **2. Navigation Always Disabled**
- Verify current time calculation
- Check time slot configuration in `.env`
- Confirm helper functions work correctly

#### **3. No Orders Showing**
- Run seed script to create test data
- Check database connection
- Verify provider authentication

#### **4. Cron Jobs Not Working**
- Check CRON_SECRET in environment
- Verify database connection
- Check console logs for errors

#### **5. Status Updates Not Reflecting**
- Check API endpoints are working
- Verify delivery order IDs are correct
- Test real-time connection status

### **Debug Commands**

```bash
# Check server logs
npm run dev

# Test API endpoints
curl "http://localhost:3000/api/test-cron"

# Verify database connection
# Check MongoDB logs

# Test authentication
# Login as provider and check network tab
```

## Performance Testing 📊

### **Load Testing Scenarios**
1. **Multiple Orders**: Test with 50+ delivery orders
2. **Concurrent Users**: Multiple providers using system
3. **Real-time Updates**: High frequency status changes
4. **GPS Tracking**: Continuous location updates

### **Expected Performance**
- Map loads within 3 seconds
- Status updates reflect within 30 seconds
- GPS updates every 1-2 seconds
- Cron jobs complete within 10 seconds

## Security Testing 🔒

### **Authentication Tests**
1. Try accessing delivery dashboard without login
2. Test provider role restrictions
3. Verify cron job authentication
4. Test API endpoint security

### **Data Validation Tests**
1. Invalid status values
2. Malformed order IDs
3. Invalid time slot values
4. SQL injection attempts

## Status: ✅ READY FOR TESTING

The delivery system is fully implemented and ready for comprehensive testing. Follow this guide to verify all functionality works as expected.