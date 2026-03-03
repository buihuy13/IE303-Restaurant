"use client";

import { useState } from "react";

import type { ChatRoomMock } from "./mock";
import ChatRoomList from "./ChatRoomList";
import ChatSidebarHeader from "./ChatSidebarHeader";
import { useChatSidebar } from "@/hooks/chat/useChatSidebar";

type ChatSidebarProps = {
  rooms: ChatRoomMock[];
  selectedRoomId: string | null;
  onSelectRoom: (roomId: string) => void;
};

export default function ChatSidebar({
  rooms,
  selectedRoomId,
  onSelectRoom,
}: ChatSidebarProps) {
  const { search, setSearch, filteredRooms, hasSearch } = useChatSidebar(rooms);

  return (
    <aside className="w-full lg:w-80 border-r border-gray-200 bg-white flex flex-col">
      <ChatSidebarHeader search={search} onSearchChange={setSearch} />
      <ChatRoomList
        rooms={filteredRooms}
        selectedRoomId={selectedRoomId}
        hasSearch={hasSearch}
        onSelectRoom={onSelectRoom}
      />
    </aside>
  );
}

