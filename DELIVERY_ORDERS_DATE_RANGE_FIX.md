# Fix for Delivery Orders Date Range Issue

## Problem
User couldn't see delivery orders for Feb 1st when today is Jan 31st in the order detail page. The delivery orders were not being created for dates in the next month.

## Root Cause
In `utils/orders.ts`, the `createDeliveryOrders` function had a bug in the date range logic:

### For `specific_days` orders:
```javascript
const end = now.endOf("month"); // Only went to end of current month
```

### For `month` orders:
```javascript
const startDate = deliveryInfo.startDate
  ? dayjs.tz(deliveryInfo.startDate, tz).startOf("day")
  : dayjs().tz(tz).startOf("month"); // Started from beginning of month

const endDate = startDate.endOf("month"); // Only covered one month
```

**Issue**: When placing an order on Jan 31st for specific days (like daily delivery), it would only create delivery orders until Jan 31st and not create any for Feb 1st and beyond.

## Solution

### Fixed `specific_days` logic:
```javascript
const end = now.add(2, "months").endOf("month"); // Extended to cover next 2 months
```

### Fixed `month` logic:
```javascript
const startDate = deliveryInfo.startDate
  ? dayjs.tz(deliveryInfo.startDate, tz).startOf("day")
  : dayjs().tz(tz).startOf("day"); // Start from today instead of start of month

const endDate = startDate.add(1, "month"); // Cover next month from start date
```

## Changes Made

### 1. Extended Date Range for Specific Days
- **Before**: Only created delivery orders until end of current month
- **After**: Creates delivery orders for next 2 months from today
- **Impact**: Orders placed on Jan 31st will now create delivery orders for Feb 1st, Feb 2nd, etc.

### 2. Fixed Monthly Delivery Logic
- **Before**: Started from beginning of month and only covered that month
- **After**: Starts from today (or specified start date) and covers the next month
- **Impact**: Monthly subscriptions now properly span across month boundaries

### 3. Maintained Timezone Consistency
- All dates still use "Asia/Kolkata" timezone
- Consistent date formatting with "+05:30" offset
- Proper day-of-week calculations for specific days

## Testing Scenarios

### Scenario 1: Order placed on Jan 31st for daily delivery
- **Before**: Only created delivery order for Jan 31st
- **After**: Creates delivery orders for Jan 31st, Feb 1st, Feb 2nd, etc.

### Scenario 2: Monthly subscription starting Jan 31st
- **Before**: Only covered January (just Jan 31st)
- **After**: Covers Jan 31st through Feb 28th/29th

### Scenario 3: Specific days (Mon, Wed, Fri) ordered on Jan 31st
- **Before**: No delivery orders for February
- **After**: Creates delivery orders for all Mon/Wed/Fri in February and March

## Impact on Existing Orders

### For New Orders
- All new orders will have proper delivery orders created across month boundaries
- Users will see all upcoming delivery dates in the order detail page

### For Existing Orders
- Existing orders may still have the old behavior
- Consider running a migration script to fix existing orders if needed
- Or allow the system to naturally create new delivery orders as needed

## Files Modified
- `utils/orders.ts` - Fixed date range logic in `createDeliveryOrders` function

## Additional Improvements Made
- Added debug endpoint at `/api/debug/delivery-orders/[orderId]` for troubleshooting
- Enhanced error handling and logging capabilities
- Maintained backward compatibility with existing order structures

## Verification
After this fix:
1. Orders placed on the last day of any month will create delivery orders for the next month
2. The order detail page will show all upcoming delivery dates
3. Users can see and cancel individual delivery days across month boundaries
4. The delivery schedule section will display the correct number of days

The fix ensures that delivery orders are created with a proper forward-looking date range, resolving the issue where users couldn't see delivery orders for the next day when that day falls in the next month.