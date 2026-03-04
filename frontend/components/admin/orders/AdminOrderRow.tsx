type AdminOrderRowProps = {
  orderId: string;
  userId: string;
  createdAt: string;
  totalFormatted: string;
  status: string;
};

export function AdminOrderRow({
  orderId,
  userId,
  createdAt,
  totalFormatted,
  status,
}: AdminOrderRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">#{orderId}</p>
        <p className="text-sm text-gray-500">
          User {userId} • {new Date(createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-semibold text-gray-900">{totalFormatted}</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {status}
        </span>
      </div>
    </li>
  );
}
