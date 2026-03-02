"use client";

import Button from "@/components/client/Button";
import type { ContactFormData } from "@/hooks/client/contact/useContactForm";

interface ContactFormProps {
    formData: ContactFormData;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function ContactForm({ formData, onChange, onSubmit }: ContactFormProps) {
    return (
        <div className="mt-16 max-w-4xl mx-auto">
            <form onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        placeholder="Your name here"
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="Your email here"
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        placeholder="Your phone number here"
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                    <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={onChange}
                        placeholder="Sub. I want to become a partner"
                        required
                        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={onChange}
                        placeholder="Write your message here"
                        required
                        rows={8}
                        className="md:col-span-2 w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-md focus:ring-2 focus:ring-brand-purple outline-none"
                    />
                    <div className="md:col-span-2 flex justify-center">
                        <Button
                            type="submit"
                            className="bg-brand-purple text-white hover:bg-brand-purple/90 outline-none cursor-pointer"
                        >
                            Send Message
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
