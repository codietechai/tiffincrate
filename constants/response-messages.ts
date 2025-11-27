export const SUCCESSMESSAGE = {
  AUTHENTICATED: "Authenticated",

  // Admin
  ADMIN_SIGNUP: "Admin signed up successfully",
  ADMIN_LOGIN: "Admin logged in successfully",
  ADMIN_FETCH: "Admin fetched successfully",
  ADMINS_FETCH: "Admins fetched successfully",
  ADMIN_UPDATE: "Admin updated successfully",
  ADMIN_DELETE: "Admin deleted successfully",

  // Provider
  PROVIDER_SIGNUP: "Provider signed up successfully",
  PROVIDER_LOGIN: "Provider logged in successfully",
  PROVIDER_FETCH: "Provider fetched successfully",
  PROVIDERS_FETCH: "Providers fetched successfully",
  PROVIDER_UPDATE: "Provider updated successfully",
  PROVIDER_DELETE: "Provider deleted successfully",

  // Consumer
  CONSUMER_SIGNUP: "Consumer signed up successfully",
  CONSUMER_LOGIN: "Consumer logged in successfully",
  CONSUMER_FETCH: "Consumer fetched successfully",
  CONSUMERS_FETCH: "Consumers fetched successfully",
  CONSUMER_UPDATE: "Consumer updated successfully",
  CONSUMER_DELETE: "Consumer deleted successfully",

  // Menu
  MENU_CREATE: "Menu created successfully",
  MENUS_FETCH: "Menus fetched successfully",
  MENU_FETCH: "Menu fetched successfully",
  MENU_UPDATE: "Menu updated successfully",
  MENU_DELETE: "Menu deleted successfully",

  // Notification
  NOTIFICATION_SEND: "Notification sent successfully",
  NOTIFICATIONS_FETCH: "Notifications fetched successfully",
  NOTIFICATION_FETCH: "Notification fetched successfully",
  NOTIFICATION_MARK_READ: "Notification marked as read",
  NOTIFICATION_DELETE: "Notification deleted successfully",

  // Help Request
  HELPREQUEST_CREATE: "Help request submitted successfully",
  HELPREQUESTS_FETCH: "Help requests fetched successfully",
  HELPREQUEST_FETCH: "Help request fetched successfully",
  HELPREQUEST_RESOLVE: "Help request resolved successfully",
  HELPREQUEST_UPDATE: "Help request updated successfully",
  HELPREQUEST_DELETE: "Help request deleted successfully",

  // Settings (cannot be created)
  SETTINGS_FETCH: "Settings fetched successfully",
  SETTINGS_UPDATE: "Settings updated successfully",
  SETTINGS_RESET: "Settings reset to defaults successfully",

  // Order
  ORDER_CREATE: "Order created successfully",
  ORDERS_FETCH: "Orders fetched successfully",
  ORDER_FETCH: "Order fetched successfully",
  ORDER_UPDATE: "Order updated successfully",
  ORDER_CANCEL: "Order cancelled successfully",
  ORDER_COMPLETE: "Order completed successfully",
  ORDER_ASSIGN_DELIVERY: "Order assigned to delivery partner successfully",

  // Review
  REVIEW_CREATE: "Review created successfully",
  REVIEWS_FETCH: "Reviews fetched successfully",
  REVIEW_FETCH: "Review fetched successfully",
  REVIEW_UPDATE: "Review updated successfully",
  REVIEW_DELETE: "Review deleted successfully",

  // Delivery Assignment
  DELIVERYASSIGNMENT_CREATE: "Delivery assignment created successfully",
  DELIVERYASSIGNMENTS_FETCH: "Delivery assignments fetched successfully",
  DELIVERYASSIGNMENT_FETCH: "Delivery assignment fetched successfully",
  DELIVERYASSIGNMENT_UPDATE: "Delivery assignment updated successfully",
  DELIVERYASSIGNMENT_CANCEL: "Delivery assignment cancelled successfully",

  // Delivery Partner
  DELIVERYPARTNER_SIGNUP: "Delivery partner signed up successfully",
  DELIVERYPARTNER_FETCH: "Delivery partner fetched successfully",
  DELIVERYPARTNERS_FETCH: "Delivery partners fetched successfully",
  DELIVERYPARTNER_UPDATE: "Delivery partner updated successfully",
  DELIVERYPARTNER_DELETE: "Delivery partner deleted successfully",

  // Generic / Auth
  PASSWORD_RESET: "Password reset successfully",
  TOKEN_REFRESH: "Token refreshed successfully",
  LOGOUT: "Logged out successfully",

  ADDRESS_CREATED: "Address created successfully",
  ADDRESS_FETCHED: "Address fetched successfully",
  ADDRESS_UPDATED: "Address updated successfully",
  ADDRESS_REMOVED: "Address removed successfully",
};

export const ERRORMESSAGE = {
  // Generic
  INTERNAL: "Internal server error",
  BAD_REQUEST: "Bad request",
  VALIDATION_ERROR: "Validation failed",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Resource not found",
  ALREADY_EXISTS: "Resource already exists",
  RATE_LIMIT: "Too many requests, try again later",
  TIMEOUT: "Request timed out",
  SERVICE_UNAVAILABLE: "Service temporarily unavailable",

  // Auth / Users
  AUTH_INVALID_CREDENTIALS: "Invalid credentials",
  AUTH_TOKEN_EXPIRED: "Authentication token expired",
  AUTH_TOKEN_INVALID: "Invalid authentication token",
  AUTH_PASSWORD_WEAK: "Password does not meet complexity requirements",
  AUTH_EMAIL_TAKEN: "Email already in use",

  // Admin
  ADMIN_NOT_FOUND: "Admin not found",
  ADMIN_CREATE_FORBIDDEN: "Admin signup is not allowed",
  ADMIN_UPDATE_FAILED: "Failed to update admin",
  ADMIN_DELETE_FAILED: "Failed to delete admin",

  // Provider
  PROVIDER_NOT_FOUND: "Provider not found",
  PROVIDERS_FETCH: "failed to fetch providers",
  PROVIDER_SIGNUP_FAILED: "Provider signup failed",
  PROVIDER_UPDATE_FAILED: "Failed to update provider",
  PROVIDER_DELETE_FAILED: "Failed to delete provider",

  // Consumer
  CONSUMER_NOT_FOUND: "Consumer not found",
  CONSUMERS_FETCH: "failed to fetch consumers",
  CONSUMER_SIGNUP_FAILED: "Consumer signup failed",
  CONSUMER_UPDATE_FAILED: "Failed to update consumer",
  CONSUMER_DELETE_FAILED: "Failed to delete consumer",

  // Menu
  MENU_NOT_FOUND: "Menu not found",
  MENUS_FETCH_FAILED: "Error while fetching menus",
  MENU_CREATE_FAILED: "Failed to create menu",
  MENU_UPDATE_FAILED: "Failed to update menu",
  MENU_DELETE_FAILED: "Failed to delete menu",

  // Notification
  NOTIFICATION_SEND_FAILED: "Failed to send notification",
  NOTIFICATIONS_FETCH_FAILED: "Error while fetching notifications",
  NOTIFICATION_NOT_FOUND: "Notification not found",
  NOTIFICATION_MARK_READ_FAILED: "Failed to mark notification as read",

  // Help Request
  HELPREQUEST_CREATE_FAILED: "Failed to submit help request",
  HELPREQUEST_NOT_FOUND: "Help request not found",
  HELPREQUEST_FETCH_FAILED: "Error while fetching help requests",
  HELPREQUEST_RESOLVE_FAILED: "Failed to resolve help request",

  // Settings
  SETTINGS_FETCH_FAILED: "Error while fetching settings",
  SETTINGS_UPDATE_FAILED: "Failed to update settings",
  SETTINGS_NOT_EDITABLE: "This setting cannot be created or edited",

  // Order / Payments
  ORDER_NOT_FOUND: "Order not found",
  ORDERS_FETCH_FAILED: "Error while fetching orders",
  ORDER_CREATE_FAILED: "Failed to create order",
  ORDER_UPDATE_FAILED: "Failed to update order",
  ORDER_CANCEL_FAILED: "Failed to cancel order",
  ORDER_PAYMENT_FAILED: "Payment failed",
  ORDER_INVALID_STATUS: "Invalid order status for this action",
  INSUFFICIENT_FUNDS: "Insufficient funds",

  // Review
  REVIEW_NOT_FOUND: "Review not found",
  REVIEWS_FETCH_FAILED: "Error while fetching reviews",
  REVIEW_CREATE_FAILED: "Failed to create review",
  REVIEW_UPDATE_FAILED: "Failed to update review",
  REVIEW_DELETE_FAILED: "Failed to delete review",

  // Delivery Assignment
  DELIVERYASSIGNMENT_NOT_FOUND: "Delivery assignment not found",
  DELIVERYASSIGNMENTS_FETCH_FAILED: "Error while fetching delivery assignments",
  DELIVERYASSIGNMENT_CREATE_FAILED: "Failed to create delivery assignment",
  DELIVERYASSIGNMENT_UPDATE_FAILED: "Failed to update delivery assignment",
  DELIVERYASSIGNMENT_CANCEL_FAILED: "Failed to cancel delivery assignment",
  DELIVERYASSIGNMENT_ASSIGN_FAILED: "Failed to assign delivery partner",

  // Delivery Partner
  DELIVERYPARTNER_NOT_FOUND: "Delivery partner not found",
  DELIVERYPARTNER_SIGNUP_FAILED: "Delivery partner signup failed",
  DELIVERYPARTNER_UPDATE_FAILED: "Failed to update delivery partner",
  DELIVERYPARTNER_DELETE_FAILED: "Failed to delete delivery partner",

  // Integrations / External
  STRIPE_ERROR: "Payment provider error",
  PLAID_ERROR: "Bank integration error",
  EXTERNAL_SERVICE_ERROR: "External service error",

  // Permissions / Actions
  ACTION_NOT_ALLOWED: "This action is not allowed",
  RESOURCE_LOCKED: "Resource is locked or in use",

  // Fallback
  UNKNOWN_ERROR: "An unknown error occurred",
};
