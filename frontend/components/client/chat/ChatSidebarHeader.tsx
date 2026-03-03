import { Search } from "lucide-react";

type ChatSidebarHeaderProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export default function ChatSidebarHeader({
  search,
  onSearchChange,
}: ChatSidebarHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search for shops..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#EE4D2D]/20 focus:bg-white transition-all"
        />
      </div>
    </div>
  );
}

