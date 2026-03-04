import Link from "next/link";

type MerchantFoodFormProps = {
  name: string;
  price: string;
  category: string;
  onNameChange: (v: string) => void;
  onPriceChange: (v: string) => void;
  onCategoryChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitLabel: string;
  cancelHref: string;
};

/** Chỉ render form thêm/sửa món: 3 field + nút Submit + Cancel */
export function MerchantFoodForm({
  name,
  price,
  category,
  onNameChange,
  onPriceChange,
  onCategoryChange,
  onSubmit,
  submitLabel,
  cancelHref,
}: MerchantFoodFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. Pepperoni Pizza"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Price (₫)
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => onPriceChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="150000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="e.g. Pizza"
          />
        </div>
      </div>
      <div className="mt-6 flex gap-3">
        <button
          type="submit"
          className="rounded-lg bg-[#EE4D2D] px-4 py-2 text-sm font-medium text-white hover:bg-[#EE4D2D]/90"
        >
          {submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
