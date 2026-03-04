export type MockGroupOrderStatus =
  | "open"
  | "locked"
  | "ordered"
  | "cancelled";

export type MockParticipantItem = {
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string;
};

export type MockGroupOrderParticipant = {
  id: string;
  userId: string;
  userName: string;
  items: MockParticipantItem[];
  totalAmount: number;
  paymentStatus: "paid" | "unpaid";
};

export type MockDeliveryAddress = {
  street: string;
  city: string;
  state?: string;
  zipCode?: string;
};

export type MockGroupOrder = {
  groupOrderId: string;
  shareToken: string;
  creatorId: string;
  restaurantName: string;
  deliveryAddress: MockDeliveryAddress;
  participants: MockGroupOrderParticipant[];
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  finalAmount: number;
  paymentMethod: "split" | "cash" | "card" | "wallet";
  status: MockGroupOrderStatus;
  groupNote?: string;
};

export const mockGroupOrder: MockGroupOrder = {
  groupOrderId: "GO-001",
  shareToken: "mock-share-token",
  creatorId: "u-1",
  restaurantName: "Mock Pizza House",
  deliveryAddress: {
    street: "123 Nguyen Hue",
    city: "Ho Chi Minh City",
    state: "",
    zipCode: "700000",
  },
  participants: [
    {
      id: "u-1",
      userId: "u-1",
      userName: "You",
      items: [
        { name: "Pepperoni Pizza", quantity: 1, price: 150000 },
        { name: "Coke", quantity: 2, price: 15000 },
      ],
      totalAmount: 180000,
      paymentStatus: "unpaid",
    },
    {
      id: "u-2",
      userId: "u-2",
      userName: "Friend A",
      items: [{ name: "Hawaiian Pizza", quantity: 1, price: 160000 }],
      totalAmount: 160000,
      paymentStatus: "unpaid",
    },
  ],
  totalAmount: 340000,
  deliveryFee: 15000,
  tax: 17000,
  finalAmount: 372000,
  paymentMethod: "split",
  status: "open",
  groupNote: "Giao trước 12h trưa nhé.",
};

/** Map shareToken -> group order for "not found" when token missing */
export const mockGroupOrdersByToken: Record<string, MockGroupOrder> = {
  [mockGroupOrder.shareToken]: mockGroupOrder,
};
