export type MockParticipant = {
  id: string;
  name: string;
  items: { name: string; quantity: number; price: number }[];
};

export type MockGroupOrder = {
  id: string;
  restaurantName: string;
  shareToken: string;
  status: "OPEN" | "LOCKED" | "ORDERED";
  participants: MockParticipant[];
};

export const mockGroupOrder: MockGroupOrder = {
  id: "go-1",
  restaurantName: "Mock Pizza House",
  shareToken: "mock-share-token",
  status: "OPEN",
  participants: [
    {
      id: "u-1",
      name: "You",
      items: [
        { name: "Pepperoni Pizza", quantity: 1, price: 150000 },
        { name: "Coke", quantity: 2, price: 15000 },
      ],
    },
    {
      id: "u-2",
      name: "Friend A",
      items: [{ name: "Hawaiian Pizza", quantity: 1, price: 160000 }],
    },
  ],
};

