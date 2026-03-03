export type ChatRoomMock = {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export type ChatMessageMock = {
  id: string;
  roomId: string;
  sender: "me" | "partner";
  content: string;
  timestamp: string;
};

export const mockChatRooms: ChatRoomMock[] = [
  {
    id: "room-1",
    name: "Pizza House",
    lastMessage: "Your order is on the way 🚚",
    lastMessageTime: "2025-01-01T10:00:00Z",
    unreadCount: 0,
  },
  {
    id: "room-2",
    name: "Sushi Corner",
    lastMessage: "Thank you for your feedback!",
    lastMessageTime: "2025-01-02T12:30:00Z",
    unreadCount: 3,
  },
];

export const mockChatMessages: ChatMessageMock[] = [
  {
    id: "m-1",
    roomId: "room-1",
    sender: "partner",
    content: "Hi, we received your order.",
    timestamp: "2025-01-01T09:55:00Z",
  },
  {
    id: "m-2",
    roomId: "room-1",
    sender: "me",
    content: "Great, thank you!",
    timestamp: "2025-01-01T09:56:00Z",
  },
  {
    id: "m-3",
    roomId: "room-1",
    sender: "partner",
    content: "Your order is on the way 🚚",
    timestamp: "2025-01-01T10:00:00Z",
  },
  {
    id: "m-4",
    roomId: "room-2",
    sender: "me",
    content: "The sushi was amazing!",
    timestamp: "2025-01-02T12:20:00Z",
  },
  {
    id: "m-5",
    roomId: "room-2",
    sender: "partner",
    content: "Thank you for your feedback!",
    timestamp: "2025-01-02T12:30:00Z",
  },
];

