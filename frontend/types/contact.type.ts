export interface ContactBranch {
    name: string;
    address: string;
    phone: string;
}

export interface ContactSocialLink {
    type: "facebook" | "instagram" | "twitter" | "tiktok" | "zalo" | "other";
    label: string;
    url: string;
}

export interface ContactFaqItem {
    question: string;
    answer: string;
}

export interface ContactConfig {
    hotline: string;
    email: string;
    workingHours: string;
    branches: ContactBranch[];
    socialLinks: ContactSocialLink[];
    faq: ContactFaqItem[];
}

