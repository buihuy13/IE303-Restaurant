type AdminMerchantRowProps = {
  restaurantName: string;
  email: string;
  status: string;
};

export function AdminMerchantRow({
  restaurantName,
  email,
  status,
}: AdminMerchantRowProps) {
  const statusClass =
    status === "approved"
      ? "bg-green-100 text-green-800"
      : "bg-amber-100 text-amber-800";

  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{restaurantName}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <span
        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}
      >
        {status}
      </span>
    </li>
  );
}
