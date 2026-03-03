export type MockRestaurant = {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  etaMinutes: string;
  promo: string;
  slug: string;
  tags: string[];
  // detail fields for /restaurants/[slug] mock page
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  totalReviews: number;
};

export const mockRestaurants: MockRestaurant[] = [
  {
    id: "r-1",
    name: "Pho 24 - Beef Pho",
    rating: 4.6,
    distanceKm: 0.8,
    etaMinutes: "20-30 min",
    promo: "Save 30.000đ",
    slug: "pho-24-beef-pho",
    tags: ["Pho", "Vietnamese"],
    address: "24 Nguyen Trai, District 1, Ho Chi Minh City",
    phone: "0901 234 567",
    openingTime: "07:00",
    closingTime: "22:00",
    totalReviews: 245,
  },
  {
    id: "r-2",
    name: "Broken Rice 123",
    rating: 4.4,
    distanceKm: 1.2,
    etaMinutes: "25-35 min",
    promo: "Free delivery",
    slug: "broken-rice-123",
    tags: ["Rice", "Vietnamese"],
    address: "123 Le Loi, District 1, Ho Chi Minh City",
    phone: "0902 345 678",
    openingTime: "08:00",
    closingTime: "21:30",
    totalReviews: 182,
  },
  {
    id: "r-3",
    name: "Milk Tea House",
    rating: 4.8,
    distanceKm: 0.5,
    etaMinutes: "15-25 min",
    promo: "Buy 1 get 1",
    slug: "milk-tea-house",
    tags: ["Milk tea", "Drinks"],
    address: "15 Tran Hung Dao, District 5, Ho Chi Minh City",
    phone: "0903 456 789",
    openingTime: "09:00",
    closingTime: "23:00",
    totalReviews: 321,
  },
  {
    id: "r-4",
    name: "Fried Chicken Corner",
    rating: 4.3,
    distanceKm: 1.8,
    etaMinutes: "30-40 min",
    promo: "Save 40.000đ",
    slug: "fried-chicken-corner",
    tags: ["Chicken", "Fast food"],
    address: "48 Cach Mang Thang 8, District 3, Ho Chi Minh City",
    phone: "0904 567 890",
    openingTime: "10:00",
    closingTime: "22:30",
    totalReviews: 97,
  },
  {
    id: "r-5",
    name: "Snack & Fries Shop",
    rating: 4.1,
    distanceKm: 1.0,
    etaMinutes: "20-30 min",
    promo: "Combo deals",
    slug: "snack-and-fries-shop",
    tags: ["Snacks", "Fast food"],
    address: "56 Nguyen Thi Minh Khai, District 3, Ho Chi Minh City",
    phone: "0905 678 901",
    openingTime: "14:00",
    closingTime: "23:30",
    totalReviews: 64,
  },
  {
    id: "r-6",
    name: "Healthy Salad Bar",
    rating: 4.7,
    distanceKm: 2.0,
    etaMinutes: "30-45 min",
    promo: "Save 25.000đ",
    slug: "healthy-salad-bar",
    tags: ["Healthy", "Salad"],
    address: "10 Vo Van Tan, District 3, Ho Chi Minh City",
    phone: "0906 789 012",
    openingTime: "09:00",
    closingTime: "21:00",
    totalReviews: 153,
  },
  {
    id: "r-7",
    name: "Sweet Desserts Cafe",
    rating: 4.5,
    distanceKm: 1.4,
    etaMinutes: "25-35 min",
    promo: "Free topping",
    slug: "sweet-desserts-cafe",
    tags: ["Dessert", "Cafe"],
    address: "8 Bui Vien, District 1, Ho Chi Minh City",
    phone: "0907 890 123",
    openingTime: "11:00",
    closingTime: "23:59",
    totalReviews: 211,
  },
  {
    id: "r-8",
    name: "Coffee & Bakery",
    rating: 4.2,
    distanceKm: 0.9,
    etaMinutes: "15-25 min",
    promo: "Morning combo",
    slug: "coffee-and-bakery",
    tags: ["Cafe", "Bakery"],
    address: "5 Nguyen Hue, District 1, Ho Chi Minh City",
    phone: "0908 901 234",
    openingTime: "07:00",
    closingTime: "21:00",
    totalReviews: 175,
  },
];

export type MockRestaurantReview = {
  id: string;
  restaurantId: string;
  title: string;
  content: string;
  rating: number;
};

export const mockRestaurantReviews: MockRestaurantReview[] = [
  {
    id: "rv-1",
    restaurantId: "r-1",
    title: "Perfect late-night phở",
    content:
      "Nước dùng đậm đà, thịt bò mềm, giao hàng còn nóng. Rất giống quán phở quen ngoài phố.",
    rating: 5,
  },
  {
    id: "rv-2",
    restaurantId: "r-1",
    title: "Portion could be bigger",
    content:
      "Hương vị ổn, topping đầy đủ nhưng phần ăn hơi ít so với giá. Bù lại giao rất nhanh.",
    rating: 4,
  },
  {
    id: "rv-3",
    restaurantId: "r-3",
    title: "Best milk tea for coders",
    content:
      "Ít đá, không quá ngọt, uống lúc code đêm rất ổn. Trân châu mềm, không bị cứng.",
    rating: 5,
  },
  {
    id: "rv-4",
    restaurantId: "r-4",
    title: "Crispy but a bit oily",
    content:
      "Gà giòn, giao đến vẫn còn nóng nhưng hơi nhiều dầu. Phù hợp mấy hôm 'cheat day'.",
    rating: 3,
  },
];


