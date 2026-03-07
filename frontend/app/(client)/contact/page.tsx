import ContactPageClient from "@/components/client/contact/ContactPageClient";
import type { ContactConfig } from "@/types";

async function getContactConfig(): Promise<ContactConfig> {
    // Hiện tại đang trả về config tĩnh.
    // Sau này bạn có thể thay phần này bằng fetch tới API public, ví dụ:
    // const res = await fetch(`${getApiBaseUrl()}/public/contact-config`, { next: { revalidate: 3600 } });
    // return (await res.json()) as ContactConfig;

    return {
        hotline: "+84 1900 1234",
        email: "support@food-delivery.example.com",
        workingHours: "09:00 - 22:00, Thứ 2 - Chủ nhật",
        branches: [
            {
                name: "Head Office - District 1",
                address: "123 Nguyen Hue, District 1, Ho Chi Minh City",
                phone: "+84 28 1234 5678",
            },
            {
                name: "Branch - District 7",
                address: "456 Nguyen Van Linh, District 7, Ho Chi Minh City",
                phone: "+84 28 2345 6789",
            },
        ],
        socialLinks: [
            {
                type: "facebook",
                label: "Facebook",
                url: "https://facebook.com/your-page",
            },
            {
                type: "instagram",
                label: "Instagram",
                url: "https://instagram.com/your-page",
            },
            {
                type: "zalo",
                label: "Zalo OA",
                url: "https://zalo.me/your-zalo-oa",
            },
        ],
        faq: [
            {
                question: "Thời gian giao hàng trung bình là bao lâu?",
                answer: "Thông thường từ 30 - 45 phút tuỳ khu vực và tình trạng nhà hàng.",
            },
            {
                question: "Tôi có thể huỷ đơn như thế nào?",
                answer: "Bạn có thể huỷ trong mục Đơn hàng nếu tài xế chưa nhận đơn.",
            },
        ],
    };
}

export default async function ContactPage() {
    const contactConfig = await getContactConfig();

    return <ContactPageClient contactConfig={contactConfig} />;
}
