import type { ChatRoomMock } from "@/constants";

type ChatRoomListItemProps = {
  room: ChatRoomMock;
  isSelected: boolean;
  onSelect: () => void;
};

export default function ChatRoomListItem({
  room,
  isSelected,
  onSelect,
}: ChatRoomListItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full p-4 text-left transition-colors relative hover:bg-gray-50 ${
        isSelected ? "bg-orange-50 border-l-4 border-[#EE4D2D]" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-linear-to-br from-[#EE4D2D] to-orange-600 flex items-center justify-center text-white font-semibold">
            <span>{room.name.charAt(0).toUpperCase()}</span>
          </div>
          {room.unreadCount > 0 && !isSelected && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
              {room.unreadCount > 9 ? "9+" : room.unreadCount}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold truncate text-gray-900">
              {room.name}
            </p>
            <span className="text-xs text-gray-500 shrink-0 ml-2">
              2h ago
            </span>
          </div>
          <p
            className={`text-sm truncate ${
              room.unreadCount > 0 && !isSelected
                ? "font-medium text-gray-900"
                : "text-gray-500"
            }`}
          >
            {room.lastMessage}
          </p>
        </div>
      </div>
    </button>
  );
}

