"use client";

type PaymentMethod = "card" | "cod" | "wallet";

type PaymentMethodsProps = {
  selected: PaymentMethod;
  onChange: (value: PaymentMethod) => void;
};

const methods: { id: PaymentMethod; label: string; description: string }[] = [
  {
    id: "card",
    label: "Credit / Debit card",
    description: "Pay with Visa, MasterCard, JCB...",
  },
  {
    id: "cod",
    label: "Cash on delivery",
    description: "Pay in cash when the order arrives.",
  },
  {
    id: "wallet",
    label: "E-wallet",
    description: "Use your favourite wallet (Momo, ZaloPay...).",
  },
];

export default function PaymentMethods({
  selected,
  onChange,
}: PaymentMethodsProps) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Payment method</h2>
      <div className="space-y-3">
        {methods.map((method) => (
          <label
            key={method.id}
            className={`w-full flex items-start gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
              selected === method.id
                ? "border-[#EE4D2D] bg-[#EE4D2D]/5"
                : "border-gray-200 hover:bg-gray-50"
            }`}
          >
            <div className="mt-1">
              <input
                type="radio"
                name="payment-method"
                checked={selected === method.id}
                onChange={() => onChange(method.id)}
                className="h-4 w-4 text-[#EE4D2D] focus:ring-[#EE4D2D]"
                aria-label={method.label}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {method.label}
              </p>
              <p className="text-xs text-gray-500">{method.description}</p>
            </div>
          </label>
        ))}
      </div>
    </section>
  );
}

