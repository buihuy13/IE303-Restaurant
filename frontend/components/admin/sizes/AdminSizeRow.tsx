type AdminSizeRowProps = { name: string };

export function AdminSizeRow({ name }: AdminSizeRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <p className="font-medium text-gray-900">{name}</p>
      <span className="text-sm text-gray-500">Mock</span>
    </li>
  );
}
