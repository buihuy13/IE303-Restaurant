import { useMemo } from "react";

import {
  mockProducts,
  mockRestaurants,
  mockRestaurantReviews,
  type MockRestaurant,
  type MockRestaurantReview,
} from "@/constants";

type RestaurantMenuItem = {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
};

type RestaurantDetail = {
  restaurant: MockRestaurant;
  menu: RestaurantMenuItem[];
  reviews: MockRestaurantReview[];
};

export function useRestaurantDetailPage(slug: string) {
  const data: RestaurantDetail | undefined = useMemo(() => {
    const restaurant = mockRestaurants.find(
      (r) =>
        r.slug.toLowerCase() === slug.toLowerCase() ||
        r.id.toLowerCase() === slug.toLowerCase(),
    );
    if (!restaurant) return undefined;

    const menu: RestaurantMenuItem[] = mockProducts.map((p) => ({
      id: `${restaurant.id}-${p.id}`,
      name: `${p.name} @ ${restaurant.name}`,
      price: p.price,
      imageUrl: p.imageUrl,
    }));

    const reviews = mockRestaurantReviews.filter(
      (review) => review.restaurantId === restaurant.id,
    );

    return {
      restaurant,
      menu,
      reviews,
    };
  }, [slug]);

  const isNotFound = !data;

  return {
    restaurant: data?.restaurant,
    menu: data?.menu ?? [],
    reviews: data?.reviews ?? [],
    isNotFound,
  };
}


