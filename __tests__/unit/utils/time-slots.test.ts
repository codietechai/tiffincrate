import {
    parseTimeSlot,
    isWithinTimeSlot,
    canCancelOrder,
    getTimeSlotPeriods,
    getCurrentTimeSlot,
} from '@/utils/time-slots'

// Mock environment variables
const originalEnv = process.env

beforeEach(() => {
    jest.resetModules()
    process.env = {
        ...originalEnv,
        NEXT_PUBLIC_BREAKFAST_SLOT_PERIOD: '7am-8am',
        NEXT_PUBLIC_LUNCH_SLOT_PERIOD: '12pm-2pm',
        NEXT_PUBLIC_DINNER_SLOT_PERIOD: '7pm-8pm',
    }
})

afterEach(() => {
    process.env = originalEnv
})

describe('Time Slots Utility', () => {
    describe('parseTimeSlot', () => {
        it('should parse AM time correctly', () => {
            const result = parseTimeSlot('7am-8am')
            expect(result).toEqual({ start: 7, end: 8 })
        })

        it('should parse PM time correctly', () => {
            const result = parseTimeSlot('7pm-8pm')
            expect(result).toEqual({ start: 19, end: 20 })
        })

        it('should parse mixed AM/PM time correctly', () => {
            const result = parseTimeSlot('11am-1pm')
            expect(result).toEqual({ start: 11, end: 13 })
        })

        it('should parse time range crossing noon', () => {
            const result = parseTimeSlot('12pm-2pm')
            expect(result).toEqual({ start: 12, end: 14 })
        })

        it('should handle invalid format gracefully', () => {
            const result = parseTimeSlot('invalid-format')
            expect(result).toEqual({ start: 0, end: 0 })
        })
    })

    describe('isWithinTimeSlot', () => {
        it('should return true when current time is within slot', () => {
            // Mock current time to 7:30 AM
            const mockDate = new Date('2024-01-01T07:30:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = isWithinTimeSlot('breakfast')
            expect(result).toBe(true)

            jest.restoreAllMocks()
        })

        it('should return false when current time is outside slot', () => {
            // Mock current time to 9:00 AM
            const mockDate = new Date('2024-01-01T09:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = isWithinTimeSlot('breakfast')
            expect(result).toBe(false)

            jest.restoreAllMocks()
        })

        it('should handle lunch slot correctly', () => {
            // Mock current time to 1:00 PM
            const mockDate = new Date('2024-01-01T13:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = isWithinTimeSlot('lunch')
            expect(result).toBe(true)

            jest.restoreAllMocks()
        })

        it('should handle dinner slot correctly', () => {
            // Mock current time to 7:30 PM
            const mockDate = new Date('2024-01-01T19:30:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = isWithinTimeSlot('dinner')
            expect(result).toBe(true)

            jest.restoreAllMocks()
        })
    })

    describe('canCancelOrder', () => {
        it('should allow cancellation for tomorrow breakfast from today morning', () => {
            // Mock current time to 6:00 AM today
            const mockDate = new Date('2024-01-01T06:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const tomorrow = new Date('2024-01-02')
            const result = canCancelOrder(tomorrow, 'breakfast')

            expect(result.canCancel).toBe(true)
            expect(result.reason).toContain('before breakfast time')

            jest.restoreAllMocks()
        })

        it('should not allow cancellation for today breakfast after breakfast time', () => {
            // Mock current time to 9:00 AM today
            const mockDate = new Date('2024-01-01T09:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const today = new Date('2024-01-01')
            const result = canCancelOrder(today, 'breakfast')

            expect(result.canCancel).toBe(false)
            expect(result.reason).toContain('after the cutoff time')

            jest.restoreAllMocks()
        })

        it('should allow cancellation for today lunch/dinner from morning', () => {
            // Mock current time to 8:00 AM today
            const mockDate = new Date('2024-01-01T08:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const today = new Date('2024-01-01')
            const lunchResult = canCancelOrder(today, 'lunch')
            const dinnerResult = canCancelOrder(today, 'dinner')

            expect(lunchResult.canCancel).toBe(true)
            expect(dinnerResult.canCancel).toBe(true)

            jest.restoreAllMocks()
        })

        it('should not allow cancellation for past dates', () => {
            // Mock current time to today
            const mockDate = new Date('2024-01-02T10:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const yesterday = new Date('2024-01-01')
            const result = canCancelOrder(yesterday, 'lunch')

            expect(result.canCancel).toBe(false)
            expect(result.reason).toContain('past date')

            jest.restoreAllMocks()
        })

        it('should not allow cancellation beyond 2 days', () => {
            // Mock current time to today
            const mockDate = new Date('2024-01-01T10:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const threeDaysLater = new Date('2024-01-04')
            const result = canCancelOrder(threeDaysLater, 'lunch')

            expect(result.canCancel).toBe(false)
            expect(result.reason).toContain('only up to 2 days')

            jest.restoreAllMocks()
        })
    })

    describe('getTimeSlotPeriods', () => {
        it('should return all time slot periods from environment', () => {
            const result = getTimeSlotPeriods()

            expect(result).toEqual({
                breakfast: '7am-8am',
                lunch: '12pm-2pm',
                dinner: '7pm-8pm',
            })
        })

        it('should return default values when env vars are missing', () => {
            delete process.env.NEXT_PUBLIC_BREAKFAST_SLOT_PERIOD
            delete process.env.NEXT_PUBLIC_LUNCH_SLOT_PERIOD
            delete process.env.NEXT_PUBLIC_DINNER_SLOT_PERIOD

            const result = getTimeSlotPeriods()

            expect(result).toEqual({
                breakfast: '8am-9am',
                lunch: '12pm-2pm',
                dinner: '7pm-9pm',
            })
        })
    })

    describe('getCurrentTimeSlot', () => {
        it('should return breakfast during breakfast hours', () => {
            // Mock current time to 7:30 AM
            const mockDate = new Date('2024-01-01T07:30:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = getCurrentTimeSlot()
            expect(result).toBe('breakfast')

            jest.restoreAllMocks()
        })

        it('should return lunch during lunch hours', () => {
            // Mock current time to 1:00 PM
            const mockDate = new Date('2024-01-01T13:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = getCurrentTimeSlot()
            expect(result).toBe('lunch')

            jest.restoreAllMocks()
        })

        it('should return dinner during dinner hours', () => {
            // Mock current time to 7:30 PM
            const mockDate = new Date('2024-01-01T19:30:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = getCurrentTimeSlot()
            expect(result).toBe('dinner')

            jest.restoreAllMocks()
        })

        it('should return null when outside all time slots', () => {
            // Mock current time to 3:00 AM
            const mockDate = new Date('2024-01-01T03:00:00+05:30')
            jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

            const result = getCurrentTimeSlot()
            expect(result).toBeNull()

            jest.restoreAllMocks()
        })
    })
})