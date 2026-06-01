"use client";

import burger from "@/assets/HomePage/burger.png";
import noodle from "@/assets/HomePage/noodles.png";
import partner from "@/assets/HomePage/partner.svg";
import pizza from "@/assets/HomePage/pizza.png";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

const FeaturesAction = () => {
        const { theme } = useClientTheme();
        return (
                <section className="relative">
                        {/* Panel wrapper to visually separate this section */}
                        <div
                                className={`rounded-3xl border overflow-hidden ${
                                        theme === "dark"
                                                ? "surface-glass border-white/10 shadow-[0_24px_70px_rgba(2,6,25,0.45)]"
                                                : "border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)]"
                                }`}
                        >
                                {/* Subtle top accent */}
                                <div className="h-1 w-full bg-gradient-to-r from-brand-orange/20 via-brand-orange/60 to-brand-orange/20" />

                                <div className="relative px-4 py-9 sm:px-8 lg:px-10">
                                        {/* Soft background glow */}
                                        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-brand-orange/5 blur-3xl" />

                                        {/* Section heading */}
                                        <div className="mb-7 md:mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                <div>
                                                        <h2
                                                                className={`text-[28px] md:text-4xl font-bold tracking-tight ${
                                                                        theme === "dark" ? "text-white" : "text-gray-900"
                                                                }`}
                                                        >
                                                                Make ordering effortless
                                                        </h2>
                                                        <p
                                                                className={`mt-1.5 text-[15px] md:text-base ${
                                                                        theme === "dark" ? "text-white/70" : "text-gray-600"
                                                                }`}
                                                        >
                                                                Fast checkout, trusted partners, and great food nearby.
                                                        </p>
                                                </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                                <div className="w-full group">
                                                        <div
                                                                className={`rounded-2xl border overflow-hidden p-6 md:p-8 lg:p-10 h-full flex flex-col transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 ${
                                                                        theme === "dark"
                                                                                ? "bg-white/5 border-white/10 shadow-[0_16px_40px_rgba(2,6,25,0.35)] hover:border-white/20"
                                                                                : "bg-white border-gray-200/70 shadow-sm hover:shadow-lg hover:border-brand-orange/25"
                                                                }`}
                                                        >
                                        <figure className="flex items-center justify-center">
                                                <Image
                                                        src={burger}
                                                        alt="burger"
                                                        width={120}
                                                        height={120}
                                                        className="text-center relative -right-[28px] object-cover"
                                                />
                                                <Image
                                                        src={pizza}
                                                        alt="pizza"
                                                        width={120}
                                                        height={120}
                                                        className="relative right-[2px] top-[14px]"
                                                />
                                                <Image
                                                        src={noodle}
                                                        alt="noodle"
                                                        width={120}
                                                        height={120}
                                                        className="relative right-[28px] top-[3px]"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3
                                                        className={`mt-7 text-2xl lg:text-[30px] font-semibold text-center tracking-tight ${
                                                                theme === "dark" ? "text-white" : "text-gray-900"
                                                        }`}
                                                >
                                                        Order Food Now
                                                </h3>

                                                <p
                                                        className={`mt-3 text-center max-w-lg mx-auto text-[15px] lg:text-base leading-7 ${
                                                                theme === "dark" ? "text-white/72" : "text-gray-600"
                                                        }`}
                                                >
                                                        Order food and grocery delivery online from hundreds of
                                                        restaurants and shops nearby.
                                                </p>
                                        </div>
                                        <Button
                                                asChild
                                                variant="secondary"
                                                className={`mt-8 h-11 rounded-full px-6 font-semibold shadow-sm hover:shadow-md transition-shadow ${
                                                        theme === "dark"
                                                                ? "bg-white/10 border border-white/10 text-white hover:bg-white/16"
                                                                : "bg-brand-black text-white hover:bg-brand-black/85"
                                                }`}
                                        >
                                                <Link href="/?type=foods" className="flex items-center justify-center mt-auto">
                                                        Order Now
                                                </Link>
                                        </Button>
                                </div>
                                                </div>

                                                <div className="w-full group">
                                                        <div
                                                                className={`rounded-2xl border overflow-hidden p-6 md:p-8 lg:p-10 h-full flex flex-col transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 ${
                                                                        theme === "dark"
                                                                                ? "bg-white/5 border-white/10 shadow-[0_16px_40px_rgba(2,6,25,0.35)] hover:border-white/20"
                                                                                : "bg-white border-gray-200/70 shadow-sm hover:shadow-lg hover:border-brand-orange/25"
                                                                }`}
                                                        >
                                        <figure className="flex items-center justify-center relative w-full h-[150px]">
                                                <Image
                                                        src={partner}
                                                        alt="partner"
                                                        fill
                                                        className="flex items-center justify-center object-contain"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3
                                                        className={`mt-7 text-2xl lg:text-[30px] font-semibold text-center tracking-tight ${
                                                                theme === "dark" ? "text-white" : "text-gray-900"
                                                        }`}
                                                >
                                                        Partner With Us
                                                </h3>

                                                <p
                                                        className={`mt-3 text-center max-w-lg mx-auto text-[15px] lg:text-base leading-7 ${
                                                                theme === "dark" ? "text-white/72" : "text-gray-600"
                                                        }`}
                                                >
                                                        Sign up today, start earning tomorrow. Build a new career in
                                                        delivery service with us.
                                                </p>
                                        </div>
                                        <Button
                                                asChild
                                                variant="brand"
                                                className="mt-8 h-11 rounded-full px-6 font-semibold shadow-sm hover:shadow-md transition-shadow"
                                        >
                                                <Link href="/merchant/register" className="flex items-center justify-center mt-auto">
                                                        Learn More
                                                </Link>
                                        </Button>
                                </div>
                                                </div>
                                        </div>
                                </div>
                        </div>
                </section>
        );
};

export default FeaturesAction;
