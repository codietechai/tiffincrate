import { createMocks } from 'node-mocks-http'
import handler from '@/app/api/orders/route'
import { connectMongoDB } from '@/lib/mongodb'
import { Order } from '@/models/Order'
import { User } from '@/models/User'
import { ServiceProvider } from '@/models/ServiceProvider'
import { Menu } from '@/models/Menu'

// Mock the database connection and models
jest.mock('@/lib/mongodb')
jest.mock('@/models/Order')
jest.mock('@/models/User')
jest.mock('@/models/ServiceProvider')
jest.mock('@/models/Menu')

describe('/api/orders', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (connectMongoDB as jest.Mock).mockResolvedValue(true)
    })

    describe('POST /api/orders', () => {
        it('should create a new order successfully', async () => {
            const mockUser = {
                _id: 'user123',
                role: 'consumer',
                name: 'John Doe',
                email: 'john@example.com',
            }

            const mockProvider = {
                _id: 'provider123',
                businessName: 'Test Restaurant',
                userId: 'providerUser123',
            }

            const mockMenu = {
                _id: 'menu123',
                name: 'Daily Meals',
                providerId: 'provider123',
                items: [
                    {
                        _id: 'item123',
                        name: 'Rice Bowl',
                        price: 150,
                    },
                ],
            }

            const mockOrder = {
                _id: 'order123',
                consumerId: 'user123',
                providerId: 'provider123',
                menuId: 'menu123',
                items: [
                    {
                        itemId: 'item123',
                        name: 'Rice Bowl',
                        price: 150,
                        quantity: 2,
                    },
                ],
                totalAmount: 300,
                status: 'pending',
                orderType: 'specific_days',
                deliveryInfo: {
                    type: 'specific_days',
                    days: ['monday', 'wednesday', 'friday'],
                },
                timeSlot: 'lunch',
                save: jest.fn().mockResolvedValue(true),
            }

                // Mock database queries
                ; (User.findById as jest.Mock).mockResolvedValue(mockUser)
                ; (ServiceProvider.findById as jest.Mock).mockResolvedValue(mockProvider)
                ; (Menu.findById as jest.Mock).mockResolvedValue(mockMenu)
                ; (Order.prototype.save as jest.Mock).mockResolvedValue(mockOrder)

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-user-id': 'user123',
                    'x-user-role': 'consumer',
                },
                body: {
                    providerId: 'provider123',
                    menuId: 'menu123',
                    items: [
                        {
                            itemId: 'item123',
                            name: 'Rice Bowl',
                            price: 150,
                            quantity: 2,
                        },
                    ],
                    totalAmount: 300,
                    orderType: 'specific_days',
                    deliveryInfo: {
                        type: 'specific_days',
                        days: ['monday', 'wednesday', 'friday'],
                    },
                    timeSlot: 'lunch',
                    addressId: 'address123',
                },
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(201)
            const data = JSON.parse(res._getData())
            expect(data.message).toBe('Order placed successfully')
            expect(data.order).toBeDefined()
        })

        it('should return 400 for missing required fields', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-user-id': 'user123',
                    'x-user-role': 'consumer',
                },
                body: {
                    // Missing required fields
                },
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const data = JSON.parse(res._getData())
            expect(data.error).toContain('required')
        })

        it('should return 401 for unauthorized access', async () => {
            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    // Missing authentication headers
                },
                body: {
                    providerId: 'provider123',
                    menuId: 'menu123',
                    items: [],
                    totalAmount: 300,
                },
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(401)
            const data = JSON.parse(res._getData())
            expect(data.error).toBe('Unauthorized')
        })

        it('should return 404 for non-existent provider', async () => {
            const mockUser = {
                _id: 'user123',
                role: 'consumer',
            }

                ; (User.findById as jest.Mock).mockResolvedValue(mockUser)
                ; (ServiceProvider.findById as jest.Mock).mockResolvedValue(null) // Provider not found

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-user-id': 'user123',
                    'x-user-role': 'consumer',
                },
                body: {
                    providerId: 'nonexistent123',
                    menuId: 'menu123',
                    items: [
                        {
                            itemId: 'item123',
                            name: 'Rice Bowl',
                            price: 150,
                            quantity: 1,
                        },
                    ],
                    totalAmount: 150,
                    orderType: 'specific_days',
                    deliveryInfo: {
                        type: 'specific_days',
                        days: ['monday'],
                    },
                    timeSlot: 'lunch',
                    addressId: 'address123',
                },
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(404)
            const data = JSON.parse(res._getData())
            expect(data.error).toBe('Provider not found')
        })

        it('should validate order items against menu', async () => {
            const mockUser = {
                _id: 'user123',
                role: 'consumer',
            }

            const mockProvider = {
                _id: 'provider123',
                businessName: 'Test Restaurant',
            }

            const mockMenu = {
                _id: 'menu123',
                name: 'Daily Meals',
                providerId: 'provider123',
                items: [
                    {
                        _id: 'item123',
                        name: 'Rice Bowl',
                        price: 150,
                    },
                ],
            }

                ; (User.findById as jest.Mock).mockResolvedValue(mockUser)
                ; (ServiceProvider.findById as jest.Mock).mockResolvedValue(mockProvider)
                ; (Menu.findById as jest.Mock).mockResolvedValue(mockMenu)

            const { req, res } = createMocks({
                method: 'POST',
                headers: {
                    'x-user-id': 'user123',
                    'x-user-role': 'consumer',
                },
                body: {
                    providerId: 'provider123',
                    menuId: 'menu123',
                    items: [
                        {
                            itemId: 'nonexistent456', // Item not in menu
                            name: 'Invalid Item',
                            price: 200,
                            quantity: 1,
                        },
                    ],
                    totalAmount: 200,
                    orderType: 'specific_days',
                    deliveryInfo: {
                        type: 'specific_days',
                        days: ['monday'],
                    },
                    timeSlot: 'lunch',
                    addressId: 'address123',
                },
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(400)
            const data = JSON.parse(res._getData())
            expect(data.error).toContain('Invalid item')
        })
    })

    describe('GET /api/orders', () => {
        it('should return user orders with pagination', async () => {
            const mockOrders = [
                {
                    _id: 'order123',
                    consumerId: 'user123',
                    providerId: 'provider123',
                    totalAmount: 300,
                    status: 'pending',
                    createdAt: new Date(),
                },
                {
                    _id: 'order124',
                    consumerId: 'user123',
                    providerId: 'provider456',
                    totalAmount: 250,
                    status: 'confirmed',
                    createdAt: new Date(),
                },
            ]

            const mockQuery = {
                find: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockOrders),
            }

                ; (Order.find as jest.Mock).mockReturnValue(mockQuery)
                ; (Order.countDocuments as jest.Mock).mockResolvedValue(2)

            const { req, res } = createMocks({
                method: 'GET',
                headers: {
                    'x-user-id': 'user123',
                    'x-user-role': 'consumer',
                },
                query: {
                    page: '1',
                    limit: '10',
                },
            })

            await handler(req, res)

            expect(res._getStatusCode()).toBe(200)
            const data = JSON.parse(res._getData())
            expect(data.orders).toHaveLength(2)
            expect(data.pagination).toBeDefined()
            expect(data.pagination.total).toBe(2)
        })

        it('should filter orders by status', async () => {
            const mockOrders = [
                {
                    _id: 'order123',
                    status: 'pending',
                },
            ]

            const mockQuery = {
                find: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockResolvedValue(mockOrders),
            }

                ; (Order.find as jest.Mock).mockReturnValue(mockQuery)
                ; (Order.countDocuments as jest.Mock).mockResolvedValue(1)

            const { req, res } = createMocks({
                method: 'GET',
                headers: {
                    'x-user-id': 'user123',
                    'x-user-role': 'consumer',
                },
                query: {
                    status: 'pending',
                },
            })

            await handler(req, res)

            expect(Order.find).toHaveBeenCalledWith({
                consumerId: 'user123',
                status: 'pending',
            })
            expect(res._getStatusCode()).toBe(200)
        })
    })
})