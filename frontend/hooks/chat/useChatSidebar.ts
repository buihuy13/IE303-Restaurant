import { useMemo, useState } from "react";

import type { ChatRoomMock } from "@/constants";

export function useChatSidebar(rooms: ChatRoomMock[]) {
  const [search, setSearch] = useState("");

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) =>
        room.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [rooms, search],
  );

  const hasSearch = search.trim().length > 0;

  return {
    search,
    setSearch,
    filteredRooms,
    hasSearch,
  };
}

