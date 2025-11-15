export type TSettings = {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    dailySummary: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    dataCollection: boolean;
    marketing: boolean;
  };
  provider?: {
    autoAcceptOrders: boolean;
    maxOrdersPerDay: number;
    preparationTime: number;
    deliveryRadius: number;
  };
};

export type TProviderSettings = TSettings["provider"];
export type TNotificationSettings = TSettings["notifications"];
