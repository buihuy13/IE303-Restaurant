"use client";

import { useMerchantFoodNewPage } from "@/hooks/merchant/useMerchantFoodNewPage";

import { MerchantFoodForm } from "./MerchantFoodForm";

export default function MerchantFoodNewPageShell() {
  const {
    name,
    price,
    category,
    setName,
    setPrice,
    setCategory,
    handleSubmit,
  } = useMerchantFoodNewPage();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add menu item</h1>
      <MerchantFoodForm
        name={name}
        price={price}
        category={category}
        onNameChange={setName}
        onPriceChange={setPrice}
        onCategoryChange={setCategory}
        onSubmit={handleSubmit}
        submitLabel="Create (mock)"
        cancelHref="/merchant/food"
      />
    </div>
  );
}
