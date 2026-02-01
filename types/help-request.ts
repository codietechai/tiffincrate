export interface THelpRequest {
  _id: string;
  fromUserId: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  toUserId?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  type: "admin_support" | "provider_support" | "consumer_to_provider";
  subject: string;
  message: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  category: "technical" | "billing" | "order" | "account" | "general" | "delivery" | "payment";
  attachments?: string[];
  responses: Array<{
    userId: {
      _id: string;
      name: string;
      role: string;
    };
    message: string;
    timestamp: string;
    isAdmin: boolean;
    attachments?: string[];
  }>;
  assignedTo?: {
    _id: string;
    name: string;
  };
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: {
    _id: string;
    name: string;
  };
  resolutionNotes?: string;
  satisfactionRating?: number;
  tags: string[];
  relatedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}
