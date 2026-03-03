export type MockOrderStatus = "PROCESSING" | "COMPLETED" | "CANCELLED";

export type MockOrderItem = {
  id: string;
  name: string;
  quantity: number;
  price: number;
};

export type MockOrder = {
  id: string;
  code: string;
  restaurantName: string;
  createdAt: string;
  status: MockOrderStatus;
  totalAmount: number;
  items: MockOrderItem[];
};

export const mockOrders: MockOrder[] = [
  {
    id: "ord-1001",
    code: "ORD-1001",
    restaurantName: "Pho 24 - Beef Pho",
    createdAt: "2024-03-01T10:15:00Z",
    status: "PROCESSING",
    totalAmount: 185000,
    items: [
      { id: "oi-1", name: "Special Beef Pho", quantity: 1, price: 120000 },
      { id: "oi-2", name: "Spring Rolls", quantity: 2, price: 15000 },
    ],
  },
  {
    id: "ord-1002",
    code: "ORD-1002",
    restaurantName: "Broken Rice 123",
    createdAt: "2024-02-27T18:30:00Z",
    status: "COMPLETED",
    totalAmount: 92000,
    items: [{ id: "oi-3", name: "Grilled Pork Broken Rice", quantity: 1, price: 92000 }],
  },
  {
    id: "ord-1003",
    code: "ORD-1003",
    restaurantName: "Milk Tea House",
    createdAt: "2024-02-20T14:05:00Z",
    status: "CANCELLED",
    totalAmount: 65000,
    items: [{ id: "oi-4", name: "Brown Sugar Milk Tea", quantity: 2, price: 32500 }],
  },
];

