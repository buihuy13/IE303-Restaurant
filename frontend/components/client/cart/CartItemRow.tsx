type CartItemRowProps = {
  name: string;
  imageUrl: string;
  price: number;
  quantity: number;
  lineTotal: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

export function CartItemRow({
  name,
  imageUrl,
  price,
  quantity,
  lineTotal,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemRowProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={imageUrl}
          alt={name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-black">
          {name}
        </p>
        <p className="mt-1 text-xs text-brand-grey">
          {price.toLocaleString("vi-VN")}₫ / item
        </p>
        <div className="mt-2 flex items-center gap-3">
          <div className="inline-flex items-center overflow-hidden rounded-lg border border-gray-300">
            <button
              type="button"
              onClick={onDecrease}
              disabled={quantity <= 1}
              className="px-3 py-1 text-sm font-semibold text-brand-black hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm font-semibold text-brand-black">
              {quantity}
            </span>
            <button
              type="button"
              onClick={onIncrease}
              className="px-3 py-1 text-sm font-semibold text-brand-black hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="text-xs font-semibold text-red-500 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-brand-orange">
          {lineTotal.toLocaleString("vi-VN")}₫
        </p>
      </div>
    </div>
  );
}

