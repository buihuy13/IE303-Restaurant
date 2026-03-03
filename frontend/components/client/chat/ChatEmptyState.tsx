import { MessageSquare } from "lucide-react";

type ChatEmptyStateProps = {
  hasSearch: boolean;
};

export default function ChatEmptyState({ hasSearch }: ChatEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
      <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
      <p className="text-center text-sm">
        {hasSearch ? "No conversations found" : "No conversations yet"}
      </p>
    </div>
  );
}

