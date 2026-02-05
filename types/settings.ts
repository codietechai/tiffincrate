export type TSettings = {
  notifications: {
    email: boolean;
    web: boolean;
    app: boolean;
    push: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    weeklyDigest: boolean;
    monthlyDigest?: boolean; // Only for providers
    accountUpdates: boolean;
    securityAlerts: boolean;
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
