export type HomeCategoryItem = {
  name: string;
  icon: string;
};

export type HomeFlashSaleItem = {
  name: string;
  oldPrice: string;
  newPrice: string;
  discountLabel: string;
  soldPercentage: number;
};

export type HomeReview = {
  id: number;
  name: string;
  content: string;
};

export const homeCategoryItems: HomeCategoryItem[] = [
  { name: "Broken rice", icon: "🍛" },
  { name: "Milk tea", icon: "🧋" },
  { name: "Noodles & Pho", icon: "🍜" },
  { name: "Fried chicken", icon: "🍗" },
  { name: "Snacks", icon: "🍟" },
  { name: "Pizza", icon: "🍕" },
  { name: "Burger", icon: "🍔" },
  { name: "Healthy", icon: "🥗" },
  { name: "Desserts", icon: "🍰" },
  { name: "Coffee", icon: "☕" },
];

export const homeFlashSaleItems: HomeFlashSaleItem[] = [
  {
    name: "Grilled milk tea",
    oldPrice: "60.000đ",
    newPrice: "29.000đ",
    discountLabel: "-52%",
    soldPercentage: 70,
  },
  {
    name: "Pork chop broken rice",
    oldPrice: "55.000đ",
    newPrice: "35.000đ",
    discountLabel: "-36%",
    soldPercentage: 40,
  },
  {
    name: "Cheese pizza combo",
    oldPrice: "199.000đ",
    newPrice: "129.000đ",
    discountLabel: "-35%",
    soldPercentage: 55,
  },
  {
    name: "Fried chicken bucket",
    oldPrice: "150.000đ",
    newPrice: "99.000đ",
    discountLabel: "-34%",
    soldPercentage: 80,
  },
  {
    name: "Snack platter",
    oldPrice: "89.000đ",
    newPrice: "59.000đ",
    discountLabel: "-34%",
    soldPercentage: 30,
  },
  {
    name: "Beef pho",
    oldPrice: "65.000đ",
    newPrice: "45.000đ",
    discountLabel: "-31%",
    soldPercentage: 50,
  },
];

export const homeReviews: HomeReview[] = [
  {
    id: 1,
    name: "Sarah Nguyen",
    content:
      "The food always arrives hot and fresh. Ordering is super easy and fast.",
  },
  {
    id: 2,
    name: "Minh Tran",
    content:
      "Great selection of local restaurants and very reliable delivery time.",
  },
  {
    id: 3,
    name: "Linh Pham",
    content:
      "I love the interface and the promotions. Definitely my go-to food app.",
  },
];

export const homeHeroSuggestTags: string[] = [
  "Milk tea",
  "Broken rice",
  "Fish noodle soup",
  "Snacks",
  "Pizza",
  "Fried chicken",
];

