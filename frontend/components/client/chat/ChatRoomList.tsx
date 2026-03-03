import type { ChatRoomMock } from "@/constants";
import ChatEmptyState from "./ChatEmptyState";
import ChatRoomListItem from "./ChatRoomListItem";

type ChatRoomListProps = {
  rooms: ChatRoomMock[];
  selectedRoomId: string | null;
  hasSearch: boolean;
  onSelectRoom: (roomId: string) => void;
};

export default function ChatRoomList({
  rooms,
  selectedRoomId,
  hasSearch,
  onSelectRoom,
}: ChatRoomListProps) {
  if (rooms.length === 0) {
    return <ChatEmptyState hasSearch={hasSearch} />;
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="divide-y divide-gray-100">
        {rooms.map((room) => (
          <ChatRoomListItem
            key={room.id}
            room={room}
            isSelected={room.id === selectedRoomId}
            onSelect={() => onSelectRoom(room.id)}
          />
        ))}
      </div>
    </div>
  );
}

