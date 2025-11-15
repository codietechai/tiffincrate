export type TSettings = {
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    weeklyDigest: boolean;
  };
  privacy: {
    dataCollection: boolean;
    marketing: boolean;
  };
  provider?: {
    dailySummary: boolean;
    autoAcceptOrders: boolean;
    maxOrdersPerDay: number;
    deliveryRadius: number;
  };
};

export type TProviderSettings = TSettings["provider"];
export type TNotificationSettings = TSettings["notifications"];
