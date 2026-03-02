const quickCategories = ["Today Deals", "Milk Tea", "Rice Dishes", "Noodles", "Snacks"];

export function CategoryNav() {
  return (
    <nav className="border-t border-stroke/70 bg-white">
      <div className="custom-container mx-auto flex gap-6 overflow-x-auto px-4 py-2">
        {quickCategories.map((item, index) => (
          <button
            key={item}
            className="relative shrink-0 py-1 text-sm font-medium text-brand-grey transition hover:text-brand-purple"
            type="button"
          >
            <span className={index === 0 ? "text-brand-purple" : ""}>{item}</span>
            {index === 0 ? (
              <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded bg-brand-purple" />
            ) : null}
          </button>
        ))}
      </div>
    </nav>
  );
}

