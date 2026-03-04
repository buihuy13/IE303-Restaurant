import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

import { mockMerchantFoodItems } from "@/constants";

export function useMerchantFoodEditPage() {
  const params = useParams();
  const id = (params?.id as string) ?? "";

  const item = useMemo(
    () => mockMerchantFoodItems.find((i) => i.id === id),
    [id],
  );

  const [name, setName] = useState(item?.name ?? "");
  const [price, setPrice] = useState(String(item?.price ?? ""));
  const [category, setCategory] = useState(item?.category ?? "");

  useEffect(() => {
    if (item) {
      setName(item.name);
      setPrice(String(item.price));
      setCategory(item.category);
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Item updated (mock).");
  };

  return {
    id,
    item,
    isNotFound: !item,
    name,
    price,
    category,
    setName,
    setPrice,
    setCategory,
    handleSubmit,
  };
}
