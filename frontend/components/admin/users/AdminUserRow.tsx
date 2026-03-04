type AdminUserRowProps = {
  fullName: string;
  email: string;
  role: string;
};

export function AdminUserRow({ fullName, email, role }: AdminUserRowProps) {
  return (
    <li className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-gray-900">{fullName}</p>
        <p className="text-sm text-gray-500">{email}</p>
      </div>
      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
        {role}
      </span>
    </li>
  );
}
