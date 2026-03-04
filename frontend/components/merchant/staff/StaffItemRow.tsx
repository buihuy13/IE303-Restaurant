type StaffItemRowProps = {
  name: string;
  email: string;
  role: string;
};

/** Chỉ render 1 dòng nhân viên: tên, email, role badge */
export function StaffItemRow({ name, email, role }: StaffItemRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{name}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
        {role}
      </span>
    </li>
  );
}
