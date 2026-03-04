import { mockAdminMerchants } from "@/constants";

export function useAdminMerchantsPage() {
  const merchants = mockAdminMerchants;
  return { merchants };
}
