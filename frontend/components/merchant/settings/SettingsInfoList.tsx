type SettingsInfoItem = { label: string; value: string };

type SettingsInfoListProps = {
  title: string;
  items: SettingsInfoItem[];
  footerText: string;
};

/** Chỉ render danh sách key-value (dl/dt/dd) + title + footer */
export function SettingsInfoList({
  title,
  items,
  footerText,
}: SettingsInfoListProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
      <dl className="space-y-2 text-sm">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-gray-500">{item.label}</dt>
            <dd className="font-medium text-gray-900">{item.value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-gray-500">{footerText}</p>
    </div>
  );
}
