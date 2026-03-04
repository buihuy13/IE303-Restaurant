import { useMemo, useState } from "react";

import type { ChatMessageMock } from "@/constants";
import { mockChatMessages, mockChatRooms } from "@/constants";

export function useChatPageShell() {
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(
    mockChatRooms[0]?.id ?? null,
  );
  const [sentMessages, setSentMessages] = useState<ChatMessageMock[]>([]);

  const selectedRoom = useMemo(
    () => mockChatRooms.find((room) => room.id === selectedRoomId) ?? null,
    [selectedRoomId],
  );

  const messagesForRoom = useMemo(() => {
    const fromMock = mockChatMessages.filter(
      (m) => m.roomId === selectedRoomId,
    );
    const fromSent = sentMessages.filter((m) => m.roomId === selectedRoomId);
    const merged = [...fromMock, ...fromSent];
    merged.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    return merged;
  }, [selectedRoomId, sentMessages]);

  const sendMessage = (content: string) => {
    if (!selectedRoomId) return;
    const newMsg: ChatMessageMock = {
      id: `m-sent-${Date.now()}`,
      roomId: selectedRoomId,
      sender: "me",
      content,
      timestamp: new Date().toISOString(),
    };
    setSentMessages((prev) => [...prev, newMsg]);
  };

  return {
    rooms: mockChatRooms,
    selectedRoomId,
    selectedRoom,
    messagesForRoom,
    selectRoom: setSelectedRoomId,
    sendMessage,
  };
}
