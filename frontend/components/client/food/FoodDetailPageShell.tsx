"use client";

import Link from "next/link";

import { useFoodDetailPage } from "@/hooks/food/useFoodDetailPage";

type FoodDetailPageShellProps = {
  slug: string;
};

export default function FoodDetailPageShell({
  slug,
}: FoodDetailPageShellProps) {
  const { product, restaurant, isNotFound } = useFoodDetailPage(slug);

  if (isNotFound || !product) {
    return (
      <div className="custom-container py-10">
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-12 text-center">
          <p className="text-base font-semibold text-brand-black">
            Food item not found
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            This is a mock food detail page. Use one of the mock product IDs
            such as <code>p-1</code> in the URL.
          </p>
          <Link
            href="/search"
            className="mt-4 inline-flex items-center rounded-full bg-brand-orange px-4 py-2 text-xs font-semibold text-brand-white"
          >
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="custom-container py-10">
      <Link
        href="/search"
        className="text-xs font-semibold text-brand-grey hover:text-brand-orange"
      >
        ← Back to search
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="h-56 w-full overflow-hidden rounded-xl bg-gray-100 md:h-72">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-brand-black md:text-3xl">
            {product.name}
          </h1>
          <p className="mt-2 text-xl font-bold text-brand-orange">
            {product.price.toLocaleString("vi-VN")}₫
          </p>
          <p className="mt-2 text-sm text-brand-grey">
            This is a mock food detail description. In the real project this
            would be loaded from the API.
          </p>
        </section>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-brand-black">
            Restaurant (mock)
          </h2>
          {restaurant ? (
            <>
              <p className="mt-2 text-sm font-semibold text-brand-black">
                {restaurant.name}
              </p>
              <p className="mt-1 text-xs text-brand-grey">
                {restaurant.distanceKm.toFixed(1)} km • {restaurant.etaMinutes}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-brand-grey">
              No mock restaurant attached.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

