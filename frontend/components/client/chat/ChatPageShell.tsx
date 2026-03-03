"use client";

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { useChatPageShell } from "@/hooks/chat/useChatPageShell";

export default function ChatPageShell() {
  const {
    rooms,
    selectedRoomId,
    selectedRoom,
    messagesForRoom,
    selectRoom,
    sendMessage,
  } = useChatPageShell();

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="custom-container py-6 flex flex-col lg:flex-row gap-4">
        <ChatSidebar
          rooms={rooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={selectRoom}
        />
        <ChatWindow
          room={selectedRoom}
          messages={messagesForRoom}
          onSendMessage={sendMessage}
        />
      </div>
    </main>
  );
}

