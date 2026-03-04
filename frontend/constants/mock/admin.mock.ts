/** Mock data for admin dashboard & pages (IE303 – no backend) */

export const mockAdminDashboard = {
  activeUsers: 1240,
  activeMerchants: 48,
  totalRestaurants: 52,
  totalRevenue: 125000000,
  totalOrders: 3420,
  averageOrderValue: 36550,
  completionRate: 94.2,
  pendingMerchantRequests: 5,
};

export const mockAdminUsers = [
  { id: "u1", email: "user1@example.com", fullName: "User One", role: "USER", createdAt: "2024-01-15" },
  { id: "u2", email: "user2@example.com", fullName: "User Two", role: "USER", createdAt: "2024-02-01" },
];

export const mockAdminMerchants = [
  { id: "m1", email: "merchant1@example.com", restaurantName: "Pizza House", status: "approved" },
  { id: "m2", email: "merchant2@example.com", restaurantName: "Pho 24", status: "pending" },
];

export const mockAdminOrders = [
  { orderId: "O1", userId: "u1", total: 185000, status: "completed", createdAt: "2024-03-01T10:00:00Z" },
  { orderId: "O2", userId: "u2", total: 160000, status: "pending", createdAt: "2024-03-01T11:00:00Z" },
];

export const mockAdminMerchantRequests = [
  { id: "req1", email: "new@merchant.com", restaurantName: "New Restaurant", requestedAt: "2024-03-01" },
];

export const mockAdminCategories = ["Pizza", "Drinks", "Rice", "Pho", "Dessert"];
export const mockAdminSizes = ["S", "M", "L", "XL"];

export type MockAdminPromotion = {
  id: string;
  name: string;
  discountType: "percent" | "fixed";
  discountValue: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "ended";
};
export const mockAdminPromotions: MockAdminPromotion[] = [
  { id: "pr1", name: "Flash sale 20%", discountType: "percent", discountValue: 20, startDate: "2024-03-01", endDate: "2024-03-07", status: "active" },
  { id: "pr2", name: "Free ship 30k", discountType: "fixed", discountValue: 30000, startDate: "2024-03-10", endDate: "2024-03-15", status: "scheduled" },
];

export type MockAdminSetting = {
  key: string;
  label: string;
  value: string;
};
export const mockAdminSettings: MockAdminSetting[] = [
  { key: "siteName", label: "Site name", value: "Food Delivery" },
  { key: "supportEmail", label: "Support email", value: "support@example.com" },
  { key: "maxOrderAmount", label: "Max order (VND)", value: "5000000" },
];

export type MockAdminMessage = {
  id: string;
  from: string;
  subject: string;
  date: string;
  read: boolean;
};
export const mockAdminMessages: MockAdminMessage[] = [
  { id: "msg1", from: "user@example.com", subject: "Question about order", date: "2024-03-01T10:00:00Z", read: false },
  { id: "msg2", from: "merchant@example.com", subject: "Partnership request", date: "2024-03-02T09:00:00Z", read: true },
];
