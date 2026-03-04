import { mockAdminPromotions } from "@/constants";

export function useAdminPromotionsPage() {
  const promotions = mockAdminPromotions;
  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("vi-VN");
    }
    return d;
  };
  return { promotions, formatDate };
}
