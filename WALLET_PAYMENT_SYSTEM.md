# TiffinCrate Wallet & Payment System

## 🎯 System Overview

A comprehensive, secure, and audit-friendly wallet-based payment system for TiffinCrate that ensures zero financial loopholes and complete transaction transparency.

## 🏗️ Architecture

### Core Components
1. **Wallet Management** - User balance and transaction handling
2. **Payment Processing** - Order payments and settlements
3. **Withdrawal System** - User fund withdrawals with admin approval
4. **Settlement Engine** - Automated provider payments after delivery
5. **Refund Processing** - Cancellation refunds with time-based rules
6. **Admin Controls** - Complete oversight and dispute resolution

## 📊 Database Schema

### 1. Wallet Model
```typescript
interface IWallet {
  userId: ObjectId;
  userType: "customer" | "provider" | "admin";
  availableBalance: number;     // Immediately usable funds
  pendingBalance: number;       // For providers: earned but not withdrawable
  totalEarned: number;          // Lifetime earnings (providers)
  totalSpent: number;           // Lifetime spending (customers)
  status: "active" | "frozen" | "suspended";
  freezeReason?: string;
}
```

### 2. Wallet Transaction Model
```typescript
interface IWalletTransaction {
  transactionId: string;        // Unique transaction ID
  walletId: ObjectId;
  userId: ObjectId;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;         // Wallet balance after transaction
  category: TransactionCategory;
  source: TransactionSource;
  status: "pending" | "completed" | "failed" | "reversed";
  approvalStatus?: "pending" | "approved" | "rejected";
  referenceId?: ObjectId;       // Order/Delivery reference
  description: string;
  metadata?: any;
}
```

### 3. Delivery Settlement Model
```typescript
interface IDeliverySettlement {
  settlementId: string;
  deliveryOrderId: ObjectId;
  orderId: ObjectId;
  providerId: ObjectId;
  customerId: ObjectId;
  deliveryDate: Date;
  mealAmount: number;
  settlementAmount: number;
  status: "pending" | "settled" | "cancelled" | "disputed";
  deliveryConfirmedAt?: Date;
  settledAt?: Date;
}
```

### 4. Withdrawal Request Model
```typescript
interface IWithdrawalRequest {
  requestId: string;
  userId: ObjectId;
  userType: "customer" | "provider";
  amount: number;
  bankDetails: BankDetails;
  status: "pending" | "approved" | "rejected" | "processed";
  reviewedBy?: ObjectId;        // Admin who reviewed
  reviewedAt?: Date;
}
```

## 💰 Payment Flow

### 1. Order Placement & Payment
```
Customer places order → Full amount paid upfront → Admin wallet credited → Customer wallet debited
```

**Implementation:**
- Customer pays full order amount immediately
- Money goes to Admin wallet (central authority)
- Order status becomes ACTIVE
- Providers receive NO money at this stage

### 2. Daily Delivery Settlement
```
Delivery completed → Settlement triggered → Provider wallet credited → Admin wallet debited
```

**Process:**
- After successful delivery confirmation
- Daily meal amount calculated: `totalOrderAmount / numberOfDeliveryDays`
- Admin approves settlement (automatic or manual)
- Provider receives payment for that specific day

### 3. Cancellation & Refunds
```
Cancellation request → Time validation → Refund calculation → Customer wallet credited
```

**Rules:**
- **Before cutoff**: Full refund to customer wallet
- **After cutoff**: No refund, provider may still get paid if food prepared
- Refund amount: `totalOrderAmount / numberOfDeliveryDays`

## 🔐 Security & Anti-Fraud

### Data Integrity Rules
1. **No Negative Balances** - All wallet operations validate sufficient funds
2. **No Double Settlement** - Each delivery can only be settled once
3. **Idempotent Transactions** - Duplicate requests are handled safely
4. **Atomic Operations** - All multi-step operations use database transactions
5. **Audit Trail** - Every transaction is logged with complete metadata

### Transaction Categories
- `order_payment` - Customer pays for order
- `delivery_settlement` - Provider receives payment after delivery
- `cancellation_refund` - Customer gets refund for cancelled order
- `withdrawal_request` - User requests fund withdrawal
- `admin_adjustment` - Admin manual adjustments
- `promotional_credit` - Admin promotional credits

## 🎛️ Admin Controls

### Wallet Management
- **Freeze/Unfreeze** wallets in case of disputes
- **Add/Deduct** money with proper reason tracking
- **View Complete Ledger** of all transactions
- **Reverse Transactions** if needed

### Withdrawal Approval
- **Review Requests** with user details and bank information
- **Approve/Reject** with reason tracking
- **Bulk Processing** for efficient operations
- **Fraud Detection** based on patterns

### Settlement Control
- **Manual Settlement** override for special cases
- **Dispute Resolution** with proper documentation
- **Bulk Settlement** for daily operations
- **Settlement Reports** for accounting

## 📱 API Endpoints

### Wallet APIs
- `GET /api/wallet` - Get wallet details
- `POST /api/wallet` - Create wallet for new user
- `GET /api/wallet/transactions` - Transaction history
- `POST /api/wallet/add-money` - Admin add money
- `POST /api/wallet/freeze` - Admin freeze wallet

### Withdrawal APIs
- `POST /api/wallet/withdrawal` - Create withdrawal request
- `GET /api/wallet/withdrawal` - Get withdrawal requests
- `PATCH /api/wallet/withdrawal/[id]` - Approve/reject withdrawal
- `DELETE /api/wallet/withdrawal/[id]` - Cancel withdrawal

### Settlement APIs
- `POST /api/delivery/settle` - Process delivery settlement
- `PATCH /api/delivery/settle` - Auto-settle all delivered orders

## 🎨 Frontend Components

### WalletBalance Component
- Real-time balance display
- Status indicators (active/frozen)
- Quick actions (add money, withdraw, view history)
- Provider-specific stats (total earned, pending)
- Customer-specific stats (total spent)

### TransactionHistory Component
- Paginated transaction list
- Category filtering
- Status indicators
- Real-time updates
- Export functionality

### WithdrawalRequest Component
- Bank details form
- Request status tracking
- Cancellation option
- Admin approval workflow

## 🔄 Integration Points

### Order System Integration
- **Order Creation**: Automatic wallet payment processing
- **Order Cancellation**: Automatic refund processing with time validation
- **Delivery Confirmation**: Triggers settlement process

### User Management Integration
- **New User**: Automatic wallet creation
- **User Roles**: Different wallet features based on user type
- **KYC Integration**: Withdrawal limits based on verification status

## 📊 Reporting & Analytics

### Financial Reports
- Daily settlement reports
- Monthly wallet summaries
- Provider earnings reports
- Customer spending patterns
- Refund and cancellation analytics

### Audit Reports
- Complete transaction logs
- Admin action logs
- Dispute resolution tracking
- Fraud detection alerts

## 🚀 Deployment Considerations

### Environment Variables
```env
WALLET_MIN_WITHDRAWAL_CUSTOMER=50
WALLET_MIN_WITHDRAWAL_PROVIDER=100
WALLET_AUTO_SETTLEMENT_ENABLED=true
WALLET_ADMIN_APPROVAL_REQUIRED=true
```

### Database Indexes
- Wallet: `userId`, `userType`, `status`
- Transactions: `walletId + createdAt`, `userId + createdAt`, `referenceId + referenceType`
- Settlements: `providerId + deliveryDate`, `deliveryOrderId` (unique)
- Withdrawals: `userId + createdAt`, `status + createdAt`

### Monitoring & Alerts
- Low admin wallet balance alerts
- Failed transaction monitoring
- Unusual withdrawal pattern detection
- Settlement processing delays

## 🔧 Maintenance & Operations

### Daily Operations
- Auto-settlement of delivered orders
- Withdrawal request processing
- Balance reconciliation
- Fraud monitoring

### Monthly Operations
- Financial report generation
- Wallet balance audits
- Provider payout summaries
- Customer refund reports

This comprehensive wallet system ensures complete financial transparency, security, and auditability while providing a smooth user experience for all stakeholders in the TiffinCrate platform.