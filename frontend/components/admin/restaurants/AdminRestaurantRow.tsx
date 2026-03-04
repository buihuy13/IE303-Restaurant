type AdminRestaurantRowProps = {
  name: string;
  slug: string;
  rating: number;
};

export function AdminRestaurantRow({
  name,
  slug,
  rating,
}: AdminRestaurantRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{slug} • Rating {rating}</p>
      </div>
    </li>
  );
}
