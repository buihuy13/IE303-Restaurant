import { useState } from "react";
import toast from "react-hot-toast";

export function useMerchantFoodNewPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Item created (mock).");
    setName("");
    setPrice("");
    setCategory("");
  };

  return {
    name,
    price,
    category,
    setName,
    setPrice,
    setCategory,
    handleSubmit,
  };
}
