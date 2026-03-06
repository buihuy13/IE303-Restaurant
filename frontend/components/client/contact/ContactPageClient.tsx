"use client";

import { ContactPageView } from "@/components/client/contact/ContactPageView";
import { useContactForm } from "@/hooks/client/contact/useContactForm";
import type { ContactConfig } from "@/types";

interface ContactPageClientProps {
    contactConfig: ContactConfig;
}

export default function ContactPageClient({ contactConfig }: ContactPageClientProps) {
    const { formData, handleChange, handleSubmit } = useContactForm();

    return (
        <ContactPageView
            contactConfig={contactConfig}
            formData={formData}
            onChange={handleChange}
            onSubmit={handleSubmit}
        />
    );
}
