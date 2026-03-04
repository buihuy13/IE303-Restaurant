/** Mock data for merchant dashboard & pages (IE303 – no backend) */

export type MockMerchantOrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "completed"
  | "cancelled";

export type MockMerchantOrder = {
  orderId: string;
  userId: string;
  status: MockMerchantOrderStatus;
  finalAmount: number;
  paymentStatus: "paid" | "unpaid";
  createdAt: string;
  items: { productName: string; quantity: number; price: number }[];
};

export const mockMerchantRestaurant = {
  restaurantId: "r-mock-1",
  restaurantName: "Mock Pizza House",
  restaurantSlug: "mock-pizza-house",
  restaurantEnabled: true,
  totalProducts: 12,
  rating: 4.5,
  totalReviews: 128,
  address: "123 Nguyen Hue, District 1, HCMC",
  openingTime: "09:00",
  closingTime: "22:00",
};

export const mockMerchantDashboard = {
  totalOrders: 156,
  totalRevenue: 42800000,
  averageOrderValue: 274358,
  pendingOrders: 3,
  confirmedOrders: 2,
  preparingOrders: 1,
  completedOrders: 140,
  cancelledOrders: 10,
  topProducts: [
    { productId: "p1", productName: "Pepperoni Pizza", totalQuantity: 89, totalRevenue: 13350000 },
    { productId: "p2", productName: "Hawaiian Pizza", totalQuantity: 45, totalRevenue: 7200000 },
    { productId: "p3", productName: "Coke", totalQuantity: 120, totalRevenue: 1800000 },
  ],
};

export const mockMerchantOrders: MockMerchantOrder[] = [
  {
    orderId: "ORD-001",
    userId: "u-1",
    status: "pending",
    finalAmount: 185000,
    paymentStatus: "unpaid",
    createdAt: "2024-03-01T10:30:00Z",
    items: [
      { productName: "Pepperoni Pizza", quantity: 1, price: 150000 },
      { productName: "Coke", quantity: 2, price: 15000 },
    ],
  },
  {
    orderId: "ORD-002",
    userId: "u-2",
    status: "confirmed",
    finalAmount: 160000,
    paymentStatus: "paid",
    createdAt: "2024-03-01T09:15:00Z",
    items: [{ productName: "Hawaiian Pizza", quantity: 1, price: 160000 }],
  },
];

export const mockMerchantWallet = {
  balance: 12500000,
  pendingPayout: 2300000,
  lastPayoutAt: "2024-02-28",
};

export type MockMerchantFoodItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  enabled: boolean;
};

export const mockMerchantFoodItems: MockMerchantFoodItem[] = [
  { id: "f1", name: "Pepperoni Pizza", price: 150000, category: "Pizza", enabled: true },
  { id: "f2", name: "Hawaiian Pizza", price: 160000, category: "Pizza", enabled: true },
  { id: "f3", name: "Coke", price: 15000, category: "Drinks", enabled: true },
];

export const mockMerchantStaff = [
  { id: "s1", name: "Staff A", role: "Staff", email: "staff-a@mock.com" },
  { id: "s2", name: "Staff B", role: "Staff", email: "staff-b@mock.com" },
];
