import { useState } from "react";
import toast from "react-hot-toast";

export interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

const initialData: ContactFormData = {
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
};

export function useContactForm() {
    const [formData, setFormData] = useState<ContactFormData>(initialData);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        toast.success("Thank you for your message! We will get back to you shortly.");
        setFormData({ ...initialData });
    };

    return { formData, handleChange, handleSubmit };
}
