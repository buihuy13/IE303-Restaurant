export type MockBlogCategory = "recipe" | "review" | "tips" | "news" | "health" | "other";

export type MockBlogStatus = "draft" | "published" | "archived";

export type MockBlog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: MockBlogCategory;
  publishedAt: string;
  readTime: number;
  views: number;
  status: MockBlogStatus;
  likes: number;
};

export const mockBlogs: MockBlog[] = [
  {
    id: "b-1",
    slug: "how-to-build-a-perfect-banh-mi",
    title: "How to Build a Perfect Bánh Mì at Home",
    excerpt: "Layering pate, cold cuts, pickles and herbs đúng chuẩn street-food Sài Gòn.",
    content:
      "Bánh mì ngon không chỉ là nhân nhiều.\n\nĐiều quan trọng là **tỷ lệ** giữa pate, thịt, đồ chua và sốt mayo.\n\n1. Nướng nóng phần bánh tới khi vỏ giòn.\n2. Phết một lớp pate + mayo mỏng.\n3. Thịt nguội, chả lụa xếp xen kẽ, không dồn 1 chỗ.\n4. Đồ chua vắt ráo nước, thêm ngò, ớt.\n\nThử thay pate gan gà cho vị béo nhẹ và thơm hơn nếu bạn không thích quá nặng vị.",
    category: "recipe",
    publishedAt: "2024-03-01T08:00:00Z",
    readTime: 6,
    views: 128,
    status: "published",
    likes: 24,
  },
  {
    id: "b-2",
    slug: "saigon-late-night-snacks",
    title: "5 Late-Night Street Food Spots in Saigon",
    excerpt: "Tổng hợp vài chỗ ăn đêm mở tới 2–3h sáng quanh quận 1, quận 4.",
    content:
      "Nếu bạn đói khuya sau giờ làm hoặc sau khi code xong side-project, đây là vài option:\n\n- Hủ tiếu gõ Nguyễn Thị Minh Khai.\n- Ốc vỉa hè đường Vĩnh Khánh.\n- Bánh tráng nướng khu Nguyễn Huệ.\n\nNhớ mang tiền mặt vì nhiều chỗ chưa nhận chuyển khoản.",
    category: "review",
    publishedAt: "2024-02-20T12:00:00Z",
    readTime: 4,
    views: 96,
    status: "draft",
    likes: 8,
  },
  {
    id: "b-3",
    slug: "meal-prep-tips-for-busy-devs",
    title: "Meal Prep Tips for Busy Devs",
    excerpt: "3 mẹo meal-prep đơn giản để không phải gọi đồ ăn mỗi tối.",
    content:
      "Là dev thì rất dễ rơi vào vòng lặp: làm việc muộn → đói → gọi đồ ăn nhanh.\n\nThử 3 tips sau:\n\n- Nấu cơm + protein cho 3 ngày, chia hộp.\n- Ướp sẵn thịt, gà để tối chỉ việc cho vào nồi chiên.\n- Luôn trữ sẵn rau đông lạnh để thêm nhanh vào mì, bún.",
    category: "tips",
    publishedAt: "2024-01-15T09:30:00Z",
    readTime: 3,
    views: 54,
    status: "archived",
    likes: 5,
  },
];

