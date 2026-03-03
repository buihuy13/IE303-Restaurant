import {
  homeCategoryItems,
  homeFlashSaleItems,
  homeHeroSuggestTags,
  homeReviews,
} from "@/constants";

export function useHomePage() {
  return {
    categoryItems: homeCategoryItems,
    flashSaleItems: homeFlashSaleItems,
    heroSuggestTags: homeHeroSuggestTags,
    reviews: homeReviews,
  };
}

