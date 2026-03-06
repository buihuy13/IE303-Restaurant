"use client";

import type { ComponentProps } from "react";
import { ContactHero } from "@/components/client/contact/ContactHero";
import { ContactForm } from "@/components/client/contact/ContactForm";
import type { ContactConfig } from "@/types";

type ContactFormProps = ComponentProps<typeof ContactForm>;

export interface ContactPageViewProps {
    contactConfig: ContactConfig;
    formData: ContactFormProps["formData"];
    onChange: ContactFormProps["onChange"];
    onSubmit: ContactFormProps["onSubmit"];
}

export function ContactPageView({ contactConfig, formData, onChange, onSubmit }: ContactPageViewProps) {
    return (
        <main className="bg-brand-white">
            <section className="py-16 px-4">
                <div className="custom-container">
                    <ContactHero contactConfig={contactConfig} />
                    <ContactForm formData={formData} onChange={onChange} onSubmit={onSubmit} />
                </div>
            </section>
        </main>
    );
}

