import { WalletService } from '@/services/wallet-service'
import { connectMongoDB } from '@/lib/mongodb'
import { Wallet } from '@/models/Wallet'
import { WalletTransaction } from '@/models/WalletTransaction'
import { DeliverySettlement } from '@/models/DeliverySettlement'

// Mock the database connection
jest.mock('@/lib/mongodb')
jest.mock('@/models/Wallet')
jest.mock('@/models/WalletTransaction')
jest.mock('@/models/DeliverySettlement')

describe('WalletService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('createWallet', () => {
        it('should create a new wallet for a user', async () => {
            const mockWallet = {
                _id: 'wallet123',
                userId: 'user123',
                userType: 'customer',
                availableBalance: 0,
                pendingBalance: 0,
                totalEarned: 0,
                totalSpent: 0,
                status: 'active',
            }

                ; (Wallet.findOne as jest.Mock).mockResolvedValue(null)
                ; (Wallet.prototype.save as jest.Mock).mockResolvedValue(mockWallet)

            const result = await WalletService.createWallet('user123', 'customer')

            expect(Wallet.findOne).toHaveBeenCalledWith({ userId: 'user123' })
            expect(result).toEqual(mockWallet)
        })

        it('should return existing wallet if already exists', async () => {
            const existingWallet = {
                _id: 'wallet123',
                userId: 'user123',
                userType: 'customer',
                availableBalance: 100,
                status: 'active',
            }

                ; (Wallet.findOne as jest.Mock).mockResolvedValue(existingWallet)

            const result = await WalletService.createWallet('user123', 'customer')

            expect(result).toEqual(existingWallet)
        })
    })

    describe('processOrderPayment', () => {
        it('should process order payment correctly', async () => {
            const mockCustomerWallet = {
                _id: 'customerWallet',
                userId: 'customer123',
                availableBalance: 500,
                save: jest.fn().mockResolvedValue(true),
            }

            const mockAdminWallet = {
                _id: 'adminWallet',
                userId: 'admin123',
                availableBalance: 1000,
                save: jest.fn().mockResolvedValue(true),
            }

                ; (Wallet.findOne as jest.Mock)
                    .mockResolvedValueOnce(mockCustomerWallet) // Customer wallet
                    .mockResolvedValueOnce(mockAdminWallet) // Admin wallet

                ; (WalletTransaction.prototype.save as jest.Mock).mockResolvedValue(true)

            const result = await WalletService.processOrderPayment(
                'customer123',
                'order123',
                300
            )

            expect(mockCustomerWallet.availableBalance).toBe(200) // 500 - 300
            expect(mockAdminWallet.availableBalance).toBe(1300) // 1000 + 300
            expect(result.success).toBe(true)
        })

        it('should fail if customer has insufficient balance', async () => {
            const mockCustomerWallet = {
                _id: 'customerWallet',
                userId: 'customer123',
                availableBalance: 100, // Less than required 300
            }

                ; (Wallet.findOne as jest.Mock).mockResolvedValue(mockCustomerWallet)

            await expect(
                WalletService.processOrderPayment('customer123', 'order123', 300)
            ).rejects.toThrow('Insufficient wallet balance')
        })
    })

    describe('processDeliverySettlement', () => {
        it('should settle delivery payment to provider', async () => {
            const mockProviderWallet = {
                _id: 'providerWallet',
                userId: 'provider123',
                availableBalance: 200,
                totalEarned: 500,
                save: jest.fn().mockResolvedValue(true),
            }

            const mockAdminWallet = {
                _id: 'adminWallet',
                userId: 'admin123',
                availableBalance: 1000,
                save: jest.fn().mockResolvedValue(true),
            }

                ; (Wallet.findOne as jest.Mock)
                    .mockResolvedValueOnce(mockProviderWallet) // Provider wallet
                    .mockResolvedValueOnce(mockAdminWallet) // Admin wallet

                ; (DeliverySettlement.findOne as jest.Mock).mockResolvedValue(null) // No existing settlement
                ; (DeliverySettlement.prototype.save as jest.Mock).mockResolvedValue(true)
                ; (WalletTransaction.prototype.save as jest.Mock).mockResolvedValue(true)

            const result = await WalletService.processDeliverySettlement(
                'deliveryOrder123',
                'order123',
                'provider123',
                'customer123',
                new Date(),
                150
            )

            expect(mockProviderWallet.availableBalance).toBe(350) // 200 + 150
            expect(mockProviderWallet.totalEarned).toBe(650) // 500 + 150
            expect(mockAdminWallet.availableBalance).toBe(850) // 1000 - 150
            expect(result.success).toBe(true)
        })

        it('should prevent double settlement', async () => {
            const existingSettlement = {
                _id: 'settlement123',
                deliveryOrderId: 'deliveryOrder123',
                status: 'settled',
            }

                ; (DeliverySettlement.findOne as jest.Mock).mockResolvedValue(existingSettlement)

            await expect(
                WalletService.processDeliverySettlement(
                    'deliveryOrder123',
                    'order123',
                    'provider123',
                    'customer123',
                    new Date(),
                    150
                )
            ).rejects.toThrow('Delivery already settled')
        })
    })

    describe('processCancellationRefund', () => {
        it('should process refund for cancelled order', async () => {
            const mockCustomerWallet = {
                _id: 'customerWallet',
                userId: 'customer123',
                availableBalance: 200,
                save: jest.fn().mockResolvedValue(true),
            }

            const mockAdminWallet = {
                _id: 'adminWallet',
                userId: 'admin123',
                availableBalance: 1000,
                save: jest.fn().mockResolvedValue(true),
            }

                ; (Wallet.findOne as jest.Mock)
                    .mockResolvedValueOnce(mockCustomerWallet) // Customer wallet
                    .mockResolvedValueOnce(mockAdminWallet) // Admin wallet

                ; (WalletTransaction.prototype.save as jest.Mock).mockResolvedValue(true)

            const result = await WalletService.processCancellationRefund(
                'customer123',
                'order123',
                100,
                'Order cancelled before cutoff time'
            )

            expect(mockCustomerWallet.availableBalance).toBe(300) // 200 + 100
            expect(mockAdminWallet.availableBalance).toBe(900) // 1000 - 100
            expect(result.success).toBe(true)
        })
    })

    describe('getWalletBalance', () => {
        it('should return wallet balance for user', async () => {
            const mockWallet = {
                _id: 'wallet123',
                userId: 'user123',
                availableBalance: 500,
                pendingBalance: 100,
                totalEarned: 1000,
                status: 'active',
            }

                ; (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet)

            const result = await WalletService.getWalletBalance('user123')

            expect(result).toEqual(mockWallet)
            expect(Wallet.findOne).toHaveBeenCalledWith({ userId: 'user123' })
        })

        it('should return null if wallet not found', async () => {
            ; (Wallet.findOne as jest.Mock).mockResolvedValue(null)

            const result = await WalletService.getWalletBalance('nonexistent')

            expect(result).toBeNull()
        })
    })

    describe('freezeWallet', () => {
        it('should freeze wallet with reason', async () => {
            const mockWallet = {
                _id: 'wallet123',
                userId: 'user123',
                status: 'active',
                save: jest.fn().mockResolvedValue(true),
            }

                ; (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet)

            const result = await WalletService.freezeWallet(
                'user123',
                'Suspicious activity detected'
            )

            expect(mockWallet.status).toBe('frozen')
            expect(mockWallet.freezeReason).toBe('Suspicious activity detected')
            expect(result.success).toBe(true)
        })
    })

    describe('addMoney', () => {
        it('should add money to wallet', async () => {
            const mockWallet = {
                _id: 'wallet123',
                userId: 'user123',
                availableBalance: 100,
                save: jest.fn().mockResolvedValue(true),
            }

                ; (Wallet.findOne as jest.Mock).mockResolvedValue(mockWallet)
                ; (WalletTransaction.prototype.save as jest.Mock).mockResolvedValue(true)

            const result = await WalletService.addMoney(
                'user123',
                200,
                'admin123',
                'Promotional credit'
            )

            expect(mockWallet.availableBalance).toBe(300) // 100 + 200
            expect(result.success).toBe(true)
        })
    })
})