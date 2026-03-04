import { useMemo } from "react";

import { mockRestaurants } from "@/constants";

export function useAdminRestaurantsPage() {
  const restaurants = useMemo(() => mockRestaurants.slice(0, 5), []);
  return { restaurants };
}
