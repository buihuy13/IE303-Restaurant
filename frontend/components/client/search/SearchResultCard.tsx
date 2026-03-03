import Image from "next/image";

import type { Product } from "@/types";

type SearchResultCardProps = {
  product: Product;
};

export default function SearchResultCard({ product }: SearchResultCardProps) {
  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="relative w-full h-40">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-bold text-[#EE4D2D]">
          {product.price.toLocaleString("vi-VN")}₫
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Delivery in 20-30 minutes · 4.8 ★
        </p>
      </div>
    </article>
  );
}

