const trustItems = ["Secure Payments", "24/7 Customer Support", "Fast Delivery"];

export function TrustSection() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-3 border-t border-stroke py-6 text-sm text-brand-grey md:grid-cols-3">
      {trustItems.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </div>
  );
}

