"use client";

import Link from "next/link";

import { useMerchantFoodEditPage } from "@/hooks/merchant/useMerchantFoodEditPage";

import { MerchantFoodForm } from "./MerchantFoodForm";

export default function MerchantFoodEditPageShell() {
  const {
    item,
    isNotFound,
    name,
    price,
    category,
    setName,
    setPrice,
    setCategory,
    handleSubmit,
  } = useMerchantFoodEditPage();

  if (isNotFound) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600">Item not found.</p>
        <Link href="/merchant/food" className="text-[#EE4D2D] hover:underline">
          Back to menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit: {item?.name}</h1>
      <MerchantFoodForm
        name={name}
        price={price}
        category={category}
        onNameChange={setName}
        onPriceChange={setPrice}
        onCategoryChange={setCategory}
        onSubmit={handleSubmit}
        submitLabel="Save (mock)"
        cancelHref="/merchant/food"
      />
    </div>
  );
}
