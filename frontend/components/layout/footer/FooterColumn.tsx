type FooterColumnProps = {
  title: string;
  items: string[];
};

export function FooterColumn({ title, items }: FooterColumnProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-brand-black">{title}</h3>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item}>
            <a className="text-sm text-brand-grey transition-colors hover:text-brand-orange" href="#">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

