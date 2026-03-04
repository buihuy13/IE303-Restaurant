import type { MockAdminMessage } from "@/constants";

type AdminMessageRowProps = {
  message: MockAdminMessage;
  formatDate: (d: string) => string;
};

export function AdminMessageRow({ message, formatDate }: AdminMessageRowProps) {
  return (
    <li
      className={`flex items-center justify-between px-4 py-3 ${!message.read ? "bg-gray-50/50" : ""}`}
    >
      <div>
        <p className="font-medium text-gray-900">{message.subject}</p>
        <p className="text-sm text-gray-500">
          {message.from} · {formatDate(message.date)}
        </p>
      </div>
      {!message.read && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-[#EE4D2D]" />
      )}
    </li>
  );
}
