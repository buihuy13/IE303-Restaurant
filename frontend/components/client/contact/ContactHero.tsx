import Image from "next/image";
import { FoodEat } from "@/constants";
import type { ContactConfig } from "@/types";

interface ContactHeroProps {
    contactConfig: ContactConfig;
}

export function ContactHero({ contactConfig }: ContactHeroProps) {
    return (
        <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-roboto-serif text-3xl md:text-5xl font-semibold">
                Let&apos;s talk with us for any issues or problem
            </h1>

            <p className="mt-4 text-gray-600">
                Our support team is here to help you with orders, payments, or any other questions.
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-center">
                <div className="relative w-full max-w-sm mx-auto h-64">
                    <Image src={FoodEat} alt="Contact Illustration" fill className="object-contain" />
                </div>

                <div className="space-y-6 text-left">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <h2 className="font-semibold text-gray-900 text-sm">Hotline</h2>
                            <p className="mt-1 text-lg font-bold text-[#EE4D2D]">{contactConfig.hotline}</p>
                            <p className="mt-1 text-xs text-gray-500">{contactConfig.workingHours}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <h2 className="font-semibold text-gray-900 text-sm">Email</h2>
                            <p className="mt-1 text-sm text-gray-800 break-all">{contactConfig.email}</p>
                            <p className="mt-1 text-xs text-gray-500">We usually respond within 24 hours.</p>
                        </div>
                    </div>

                    {contactConfig.branches.length > 0 && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                            <h2 className="font-semibold text-gray-900 text-sm mb-3">Our branches</h2>
                            <div className="space-y-2 text-sm text-gray-700">
                                {contactConfig.branches.map((branch) => (
                                    <div key={branch.name}>
                                        <p className="font-medium">{branch.name}</p>
                                        <p className="text-gray-600">{branch.address}</p>
                                        <p className="text-gray-500 text-xs">Phone: {branch.phone}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {contactConfig.socialLinks.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                            {contactConfig.socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 rounded-full text-xs font-medium border border-gray-200 text-gray-700 hover:border-[#EE4D2D] hover:text-[#EE4D2D] transition-colors"
                                >
                                    {social.label}
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {contactConfig.faq.length > 0 && (
                <div className="mt-12 text-left max-w-3xl mx-auto">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">FAQs</h2>
                    <div className="space-y-3">
                        {contactConfig.faq.map((item) => (
                            <details
                                key={item.question}
                                className="group bg-white rounded-lg border border-gray-100 px-4 py-3"
                            >
                                <summary className="cursor-pointer text-sm font-medium text-gray-900 flex justify-between items-center">
                                    {item.question}
                                    <span className="ml-2 text-xs text-gray-400 group-open:hidden">+</span>
                                    <span className="ml-2 text-xs text-gray-400 hidden group-open:inline">-</span>
                                </summary>
                                <p className="mt-2 text-sm text-gray-700">{item.answer}</p>
                            </details>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
