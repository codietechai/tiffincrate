# Enhanced Order Cancellation System

## Overview
Implemented a comprehensive cancellation system that supports both whole order cancellation and individual delivery day cancellation with time-based rules using environment variables.

## Features Implemented

### 1. Two Types of Cancellation

#### Whole Order Cancellation
- Cancels the entire order and all remaining delivery days
- Updates main order status to "cancelled"
- Updates all delivery orders to "cancelled" status
- Requires confirmation dialog with clear warning

#### Individual Delivery Cancellation
- Cancel specific delivery days while keeping the order active
- Each delivery day can be cancelled independently
- If all deliveries are cancelled, main order becomes cancelled
- Time-based validation using environment variables

### 2. Time-Based Cancellation Rules

#### Environment Variables Used
```env
BREAKFAST_SLOT_PERIOD=7am-8am
LUNCH_SLOT_PERIOD=12pm-2pm  
DINNER_SLOT_PERIOD=7pm-8pm
```

#### Cancellation Rules
- **Same Day Cancellation**:
  - Breakfast: Can cancel until 7am same day
  - Lunch: Can cancel until 12pm same day  
  - Dinner: Can cancel until 7pm same day

- **Next Day Cancellation**:
  - Breakfast: Can cancel anytime the day before
  - Lunch: Can cancel until 12pm the day before
  - Dinner: Can cancel until 7pm the day before

- **General Rules**:
  - Can cancel up to 2 days in advance
  - Cannot cancel past deliveries
  - Cannot cancel already delivered or cancelled deliveries

### 3. API Endpoints

#### PATCH /api/orders/[id]
**Whole Order Cancellation**:
```json
{
  "action": "cancel_whole_order"
}
```

**Individual Delivery Cancellation**:
```json
{
  "action": "cancel_delivery",
  "deliveryOrderId": "delivery_order_id"
}
```

### 4. Frontend Features

#### Enhanced UI Components
- **Individual Cancel Buttons**: Each delivery day has its own cancel button
- **Cancellation Validation**: Real-time validation showing which deliveries can be cancelled
- **Visual Indicators**: "Can't cancel" text with tooltip explaining why
- **Loading States**: Individual loading states for each cancellation action
- **Confirmation Dialogs**: Clear confirmation messages for both types of cancellation

#### Cancellation Rules Display
- Shows cancellation rules in the action buttons section
- Explains time-based restrictions for each meal slot
- Displays maximum advance cancellation period

### 5. Validation Logic

#### Time Slot Validation (`utils/time-slots.ts`)
```typescript
export const canCancelDelivery = (
  deliveryDate: Date, 
  timeSlot: 'breakfast' | 'lunch' | 'dinner'
): { canCancel: boolean; reason?: string }
```

#### Validation Checks
1. **Past Delivery Check**: Cannot cancel deliveries in the past
2. **Advance Limit Check**: Cannot cancel more than 2 days in advance
3. **Time Slot Check**: Validates against environment-defined time slots
4. **Status Check**: Cannot cancel already delivered/cancelled deliveries

### 6. User Experience

#### Visual Feedback
- **Color-coded Status**: Different colors for each delivery status
- **Cancel Button States**: Enabled/disabled based on cancellation rules
- **Tooltip Messages**: Explanatory text for non-cancellable deliveries
- **Loading Indicators**: Individual loading states for each action

#### Confirmation Flow
1. User clicks cancel button (whole order or individual delivery)
2. System validates cancellation eligibility
3. Shows confirmation dialog with specific details
4. Processes cancellation with loading state
5. Shows success/error message
6. Refreshes order data to reflect changes

### 7. Business Logic

#### Order Status Management
- **Active Orders**: Can have individual deliveries cancelled
- **Partially Cancelled**: Some deliveries cancelled, others active
- **Fully Cancelled**: All deliveries cancelled, order marked as cancelled
- **Status Progression**: Proper status updates throughout the process

#### Delivery Status Tracking
- Each delivery maintains its own status independently
- Cancelled deliveries are marked with timestamp
- Remaining deliveries continue with normal flow
- Summary statistics updated in real-time

### 8. Error Handling

#### API Error Responses
- Clear error messages for validation failures
- Proper HTTP status codes
- Detailed reasons for cancellation restrictions

#### Frontend Error Handling
- Toast notifications for success/error states
- Graceful handling of network errors
- User-friendly error messages

### 9. Security & Validation

#### Role-Based Access
- Consumers can only cancel their own orders
- Providers can see but not cancel consumer orders
- Proper authentication and authorization

#### Data Integrity
- Atomic operations for status updates
- Proper timestamp tracking for all status changes
- Consistent state management across order and delivery records

## Usage Examples

### Scenario 1: Cancel Today's Lunch
- Current time: 10:00 AM
- Delivery: Today, Lunch slot
- Result: ✅ Can cancel (before 12pm cutoff)

### Scenario 2: Cancel Today's Breakfast
- Current time: 8:00 AM  
- Delivery: Today, Breakfast slot
- Result: ❌ Cannot cancel (after 7am cutoff)

### Scenario 3: Cancel Tomorrow's Dinner
- Current time: 6:00 PM today
- Delivery: Tomorrow, Dinner slot  
- Result: ✅ Can cancel (before 7pm cutoff today)

### Scenario 4: Cancel Day After Tomorrow
- Current time: Any time today
- Delivery: Day after tomorrow, Any slot
- Result: ✅ Can cancel (within 2-day limit)

## Technical Implementation

### Database Updates
- Order status updates with timestamps
- DeliveryOrder status updates with timestamps
- Proper indexing for efficient queries

### Real-time Updates
- Immediate UI updates after cancellation
- Refresh order data to show current state
- Updated delivery statistics

### Performance Considerations
- Efficient database queries
- Minimal API calls
- Optimized frontend rendering

The enhanced cancellation system provides users with granular control over their orders while maintaining business rules and ensuring data integrity.