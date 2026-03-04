type AdminRequestRowProps = {
  id: string;
  restaurantName: string;
  email: string;
  requestedAt: string;
  onApprove: (id: string) => void;
};

export function AdminRequestRow({
  id,
  restaurantName,
  email,
  requestedAt,
  onApprove,
}: AdminRequestRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{restaurantName}</p>
        <p className="text-sm text-gray-500">
          {email} • {requestedAt}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onApprove(id)}
        className="rounded-lg bg-[#EE4D2D] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#EE4D2D]/90"
      >
        Approve (mock)
      </button>
    </li>
  );
}
