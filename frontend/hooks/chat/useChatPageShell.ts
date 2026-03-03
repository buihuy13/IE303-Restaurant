import { useMemo, useState } from "react";

import { mockChatMessages, mockChatRooms } from "@/constants";

export function useChatPageShell() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    mockChatRooms[0]?.id ?? null,
  );

  const selectedRoom = useMemo(
    () => mockChatRooms.find((room) => room.id === selectedRoomId) ?? null,
    [selectedRoomId],
  );

  const messagesForRoom = useMemo(
    () =>
      mockChatMessages.filter((message) => message.roomId === selectedRoomId),
    [selectedRoomId],
  );

  const handleSendMessage = (content: string) => {
    if (!selectedRoomId) return;

    const newId = `m-${mockChatMessages.length + 1}-${Date.now()}`;
    mockChatMessages.push({
      id: newId,
      roomId: selectedRoomId,
      sender: "me",
      content,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    rooms: mockChatRooms,
    selectedRoomId,
    selectedRoom,
    messagesForRoom,
    selectRoom: setSelectedRoomId,
    sendMessage: handleSendMessage,
  };
}

