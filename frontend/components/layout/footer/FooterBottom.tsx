type FooterBottomProps = {
  year: number;
};

export function FooterBottom({ year }: FooterBottomProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 border-t border-stroke pt-6 md:flex-row md:items-center">
      <p className="text-sm text-brand-grey">© {year} E-Food. All rights reserved.</p>
      <div className="flex items-center gap-3 text-xs text-brand-grey">
        <span className="rounded border border-stroke px-2 py-1">Visa</span>
        <span className="rounded border border-stroke px-2 py-1">Mastercard</span>
        <span className="rounded border border-stroke px-2 py-1">MoMo</span>
      </div>
    </div>
  );
}

