"use client";

import { ContactHero } from "@/components/client/contact/ContactHero";
import { ContactForm } from "@/components/client/contact/ContactForm";
import { useContactForm } from "@/hooks/client/contact/useContactForm";

export default function ContactPageClient() {
    const { formData, handleChange, handleSubmit } = useContactForm();

    return (
        <main className="bg-brand-white">
            <section className="py-16 px-4">
                <div className="custom-container">
                    <ContactHero />
                    <ContactForm
                        formData={formData}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                    />
                </div>
            </section>
        </main>
    );
}
