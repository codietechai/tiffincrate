import { Types } from 'mongoose'

// User fixtures
export const mockUsers = {
    customer: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+919876543210',
        role: 'consumer',
        isVerified: true,
        createdAt: new Date('2024-01-01'),
    },
    provider: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
        name: 'Jane Smith',
        email: 'jane@restaurant.com',
        phone: '+919876543211',
        role: 'provider',
        isVerified: true,
        createdAt: new Date('2024-01-01'),
    },
    admin: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        name: 'Admin User',
        email: 'admin@tiffincrate.com',
        phone: '+919876543212',
        role: 'admin',
        isVerified: true,
        createdAt: new Date('2024-01-01'),
    },
}

// Provider fixtures
export const mockProviders = {
    restaurant1: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439021'),
        userId: mockUsers.provider._id,
        businessName: 'Tasty Tiffins',
        businessType: 'restaurant',
        address: {
            street: '123 Food Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            coordinates: {
                lat: 19.0760,
                lng: 72.8777,
            },
        },
        serviceAreas: ['400001', '400002', '400003'],
        isVerified: true,
        isActive: true,
        rating: 4.5,
        totalOrders: 150,
        createdAt: new Date('2024-01-01'),
    },
}

// Menu fixtures
export const mockMenus = {
    dailyMeals: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439031'),
        providerId: mockProviders.restaurant1._id,
        name: 'Daily Meals',
        description: 'Fresh home-cooked meals delivered daily',
        isActive: true,
        items: [
            {
                _id: new Types.ObjectId('507f1f77bcf86cd799439041'),
                name: 'Rajma Chawal',
                description: 'Kidney beans curry with basmati rice',
                price: 120,
                isVeg: true,
                category: 'main-course',
                isAvailable: true,
            },
            {
                _id: new Types.ObjectId('507f1f77bcf86cd799439042'),
                name: 'Paneer Butter Masala',
                description: 'Creamy paneer curry with naan',
                price: 180,
                isVeg: true,
                category: 'main-course',
                isAvailable: true,
            },
        ],
        createdAt: new Date('2024-01-01'),
    },
}

// Address fixtures
export const mockAddresses = {
    home: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439051'),
        userId: mockUsers.customer._id,
        type: 'home',
        street: '456 Home Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        coordinates: {
            lat: 19.0760,
            lng: 72.8777,
        },
        isDefault: true,
        createdAt: new Date('2024-01-01'),
    },
    office: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439052'),
        userId: mockUsers.customer._id,
        type: 'office',
        street: '789 Office Complex',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400002',
        coordinates: {
            lat: 19.0760,
            lng: 72.8777,
        },
        isDefault: false,
        createdAt: new Date('2024-01-01'),
    },
}

// Order fixtures
export const mockOrders = {
    weeklyOrder: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439061'),
        consumerId: mockUsers.customer._id,
        providerId: mockProviders.restaurant1._id,
        menuId: mockMenus.dailyMeals._id,
        items: [
            {
                itemId: mockMenus.dailyMeals.items[0]._id,
                name: 'Rajma Chawal',
                price: 120,
                quantity: 1,
            },
        ],
        totalAmount: 840, // 120 * 7 days
        status: 'confirmed',
        orderType: 'specific_days',
        deliveryInfo: {
            type: 'specific_days',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        },
        timeSlot: 'lunch',
        address: mockAddresses.home,
        createdAt: new Date('2024-01-01'),
        estimatedDeliveryTime: new Date('2024-01-02T13:00:00Z'),
    },
    customOrder: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439062'),
        consumerId: mockUsers.customer._id,
        providerId: mockProviders.restaurant1._id,
        menuId: mockMenus.dailyMeals._id,
        items: [
            {
                itemId: mockMenus.dailyMeals.items[1]._id,
                name: 'Paneer Butter Masala',
                price: 180,
                quantity: 1,
            },
        ],
        totalAmount: 540, // 180 * 3 days
        status: 'pending',
        orderType: 'custom_dates',
        deliveryInfo: {
            type: 'custom_dates',
            dates: ['2024-01-15', '2024-01-17', '2024-01-19'],
        },
        timeSlot: 'dinner',
        address: mockAddresses.office,
        createdAt: new Date('2024-01-01'),
    },
}

// Wallet fixtures
export const mockWallets = {
    customerWallet: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439071'),
        userId: mockUsers.customer._id,
        userType: 'customer',
        availableBalance: 1000,
        pendingBalance: 0,
        totalEarned: 0,
        totalSpent: 500,
        status: 'active',
        createdAt: new Date('2024-01-01'),
    },
    providerWallet: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439072'),
        userId: mockUsers.provider._id,
        userType: 'provider',
        availableBalance: 2500,
        pendingBalance: 300,
        totalEarned: 5000,
        totalSpent: 0,
        status: 'active',
        createdAt: new Date('2024-01-01'),
    },
    adminWallet: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439073'),
        userId: mockUsers.admin._id,
        userType: 'admin',
        availableBalance: 50000,
        pendingBalance: 0,
        totalEarned: 100000,
        totalSpent: 45000,
        status: 'active',
        createdAt: new Date('2024-01-01'),
    },
}

// Transaction fixtures
export const mockTransactions = {
    orderPayment: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439081'),
        transactionId: 'TXN_001',
        walletId: mockWallets.customerWallet._id,
        userId: mockUsers.customer._id,
        type: 'debit',
        amount: 840,
        balanceAfter: 160,
        category: 'order_payment',
        source: 'wallet_payment',
        status: 'completed',
        referenceId: mockOrders.weeklyOrder._id,
        referenceType: 'order',
        description: 'Payment for weekly meal order',
        createdAt: new Date('2024-01-01'),
    },
    deliverySettlement: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439082'),
        transactionId: 'TXN_002',
        walletId: mockWallets.providerWallet._id,
        userId: mockUsers.provider._id,
        type: 'credit',
        amount: 120,
        balanceAfter: 2620,
        category: 'delivery_settlement',
        source: 'admin_settlement',
        status: 'completed',
        referenceId: new Types.ObjectId('507f1f77bcf86cd799439091'),
        referenceType: 'delivery_order',
        description: 'Settlement for delivery on 2024-01-02',
        createdAt: new Date('2024-01-02'),
    },
}

// Delivery Order fixtures
export const mockDeliveryOrders = {
    mondayLunch: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439091'),
        orderId: mockOrders.weeklyOrder._id,
        consumerId: mockUsers.customer._id,
        providerId: mockProviders.restaurant1._id,
        deliveryDate: new Date('2024-01-01'),
        timeSlot: 'lunch',
        status: 'delivered',
        items: mockOrders.weeklyOrder.items,
        address: mockAddresses.home,
        deliveredAt: new Date('2024-01-01T13:30:00Z'),
        createdAt: new Date('2024-01-01'),
    },
    tuesdayLunch: {
        _id: new Types.ObjectId('507f1f77bcf86cd799439092'),
        orderId: mockOrders.weeklyOrder._id,
        consumerId: mockUsers.customer._id,
        providerId: mockProviders.restaurant1._id,
        deliveryDate: new Date('2024-01-02'),
        timeSlot: 'lunch',
        status: 'out_for_delivery',
        items: mockOrders.weeklyOrder.items,
        address: mockAddresses.home,
        createdAt: new Date('2024-01-01'),
    },
}

// Helper functions for test data
export const createMockUser = (overrides = {}) => ({
    ...mockUsers.customer,
    ...overrides,
})

export const createMockOrder = (overrides = {}) => ({
    ...mockOrders.weeklyOrder,
    ...overrides,
})

export const createMockWallet = (overrides = {}) => ({
    ...mockWallets.customerWallet,
    ...overrides,
})

export const createMockTransaction = (overrides = {}) => ({
    ...mockTransactions.orderPayment,
    ...overrides,
})

// Test database cleanup helper
export const cleanupTestData = async () => {
    // This would be implemented to clean up test data from the database
    // For now, it's a placeholder for the actual cleanup logic
    console.log('Cleaning up test data...')
}