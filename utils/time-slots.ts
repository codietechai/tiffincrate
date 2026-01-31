export interface TimeSlotPeriod {
    start: string;
    end: string;
    label: string;
}

export const TIME_SLOT_PERIODS: Record<string, TimeSlotPeriod> = {
    breakfast: {
        start: process.env.BREAKFAST_SLOT_PERIOD?.split('-')[0] || '7am',
        end: process.env.BREAKFAST_SLOT_PERIOD?.split('-')[1] || '8am',
        label: 'Breakfast (7am-8am)'
    },
    lunch: {
        start: process.env.LUNCH_SLOT_PERIOD?.split('-')[0] || '12pm',
        end: process.env.LUNCH_SLOT_PERIOD?.split('-')[1] || '2pm',
        label: 'Lunch (12pm-2pm)'
    },
    dinner: {
        start: process.env.DINNER_SLOT_PERIOD?.split('-')[0] || '7pm',
        end: process.env.DINNER_SLOT_PERIOD?.split('-')[1] || '8pm',
        label: 'Dinner (7pm-8pm)'
    }
};

export const parseTimeString = (timeStr: string): { hour: number; minute: number } => {
    const match = timeStr.match(/(\d+)(?::(\d+))?(am|pm)/i);
    if (!match) return { hour: 0, minute: 0 };

    let hour = parseInt(match[1]);
    const minute = parseInt(match[2] || '0');
    const period = match[3].toLowerCase();

    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    return { hour, minute };
};

export const isTimeSlotActive = (timeSlot: string): boolean => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();

    const period = TIME_SLOT_PERIODS[timeSlot];
    if (!period) return false;

    const startTime = parseTimeString(period.start);
    const endTime = parseTimeString(period.end);

    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = startTime.hour * 60 + startTime.minute;
    const endMinutes = endTime.hour * 60 + endTime.minute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
};

export const getNextTimeSlot = (): string => {
    const now = new Date();
    const currentHour = now.getHours();

    if (currentHour < 8) return 'breakfast';
    if (currentHour < 14) return 'lunch';
    return 'dinner';
};

export const getTimeUntilSlot = (timeSlot: string): number => {
    const now = new Date();
    const period = TIME_SLOT_PERIODS[timeSlot];
    if (!period) return 0;

    const startTime = parseTimeString(period.start);
    const slotStart = new Date();
    slotStart.setHours(startTime.hour, startTime.minute, 0, 0);

    // If the slot time has passed today, calculate for tomorrow
    if (slotStart.getTime() <= now.getTime()) {
        slotStart.setDate(slotStart.getDate() + 1);
    }

    return Math.max(0, Math.floor((slotStart.getTime() - now.getTime()) / (1000 * 60))); // minutes
};

// Cancellation logic
export const canCancelDelivery = (deliveryDate: Date, timeSlot: 'breakfast' | 'lunch' | 'dinner'): { canCancel: boolean; reason?: string } => {
    const now = new Date();
    const delivery = new Date(deliveryDate);

    // Reset time to start of day for comparison
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deliveryDay = new Date(delivery.getFullYear(), delivery.getMonth(), delivery.getDate());

    // Can't cancel deliveries in the past
    if (deliveryDay < nowDay) {
        return { canCancel: false, reason: "Cannot cancel past deliveries" };
    }

    // Can cancel up to 2 days from now
    const maxCancelDate = new Date(nowDay);
    maxCancelDate.setDate(maxCancelDate.getDate() + 2);

    if (deliveryDay > maxCancelDate) {
        return { canCancel: false, reason: "Can only cancel up to 2 days in advance" };
    }

    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour + (currentMinute / 60);

    const period = TIME_SLOT_PERIODS[timeSlot];
    if (!period) {
        return { canCancel: false, reason: "Invalid time slot" };
    }

    const slotStartTime = parseTimeString(period.start);
    const slotStartHour = slotStartTime.hour + (slotStartTime.minute / 60);

    // Same day cancellation rules
    if (deliveryDay.getTime() === nowDay.getTime()) {
        switch (timeSlot) {
            case 'breakfast':
                // Can cancel breakfast until 7am same day
                if (currentTime >= slotStartHour) {
                    return { canCancel: false, reason: "Cannot cancel breakfast after 7am on the same day" };
                }
                break;

            case 'lunch':
                // Can cancel lunch until 12pm same day
                if (currentTime >= slotStartHour) {
                    return { canCancel: false, reason: "Cannot cancel lunch after 12pm on the same day" };
                }
                break;

            case 'dinner':
                // Can cancel dinner until 7pm same day
                if (currentTime >= slotStartHour) {
                    return { canCancel: false, reason: "Cannot cancel dinner after 7pm on the same day" };
                }
                break;
        }
    }

    // Next day cancellation rules
    const tomorrow = new Date(nowDay);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (deliveryDay.getTime() === tomorrow.getTime()) {
        if (timeSlot === 'breakfast') {
            // Can cancel breakfast for tomorrow anytime today
            return { canCancel: true };
        }

        // For lunch and dinner tomorrow, can cancel until their respective times today
        if (currentTime >= slotStartHour) {
            return {
                canCancel: false,
                reason: `Cannot cancel tomorrow's ${timeSlot} after ${period.start} today`
            };
        }
    }

    // For deliveries 2 days from now, can cancel anytime
    return { canCancel: true };
};