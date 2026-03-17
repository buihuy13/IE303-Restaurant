"use client";

import burger from "@/assets/HomePage/burger.png";
import noodle from "@/assets/HomePage/noodles.png";
import partner from "@/assets/HomePage/partner.svg";
import pizza from "@/assets/HomePage/pizza.png";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";

const FeaturesAction = () => {
        return (
                <section className="relative">
                        {/* Panel wrapper to visually separate this section */}
                        <div className="rounded-3xl border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.06)] overflow-hidden">
                                {/* Subtle top accent */}
                                <div className="h-1 w-full bg-gradient-to-r from-brand-orange/20 via-brand-orange/60 to-brand-orange/20" />

                                <div className="relative px-5 py-10 sm:px-8 lg:px-10">
                                        {/* Soft background glow */}
                                        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-orange/10 blur-3xl" />
                                        <div className="pointer-events-none absolute -bottom-28 -left-28 h-80 w-80 rounded-full bg-brand-orange/5 blur-3xl" />

                                        {/* Section heading */}
                                        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                                                <div>
                                                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
                                                                Make ordering effortless
                                                        </h2>
                                                        <p className="mt-1 text-sm md:text-base text-gray-600">
                                                                Fast checkout, trusted partners, and great food nearby.
                                                        </p>
                                                </div>
                                        </div>

                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                                                <div className="w-full group">
                                                        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden p-8 lg:p-10 h-full flex flex-col transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-orange/25">
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
                                                <h3 className="mt-8 text-xl lg:text-2xl font-semibold text-gray-900 text-center tracking-tight">
                                                        Order Food Now
                                                </h3>

                                                <p className="mt-3 text-center max-w-lg mx-auto text-sm lg:text-base text-gray-600 leading-relaxed">
                                                        Order food and grocery delivery online from hundreds of
                                                        restaurants and shops nearby.
                                                </p>
                                        </div>
                                        <Button
                                                asChild
                                                variant="secondary"
                                                className="mt-7 h-11 rounded-full bg-brand-black text-white font-semibold hover:bg-brand-black/85 shadow-sm hover:shadow-md transition-shadow"
                                        >
                                                <Link href="/?type=foods" className="flex items-center justify-center mt-auto">
                                                        Order Now
                                                </Link>
                                        </Button>
                                </div>
                                                </div>

                                                <div className="w-full group">
                                                        <div className="bg-white rounded-2xl border border-gray-200/70 shadow-sm overflow-hidden p-8 lg:p-10 h-full flex flex-col transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-brand-orange/25">
                                        <figure className="flex items-center justify-center relative w-full h-[150px]">
                                                <Image
                                                        src={partner}
                                                        alt="partner"
                                                        fill
                                                        className="flex items-center justify-center object-contain"
                                                />
                                        </figure>
                                        <div className="flex-grow flex flex-col items-center">
                                                <h3 className="mt-8 text-xl lg:text-2xl font-semibold text-gray-900 text-center tracking-tight">
                                                        Partner With Us
                                                </h3>

                                                <p className="mt-3 text-center max-w-lg mx-auto text-sm lg:text-base text-gray-600 leading-relaxed">
                                                        Sign up today, start earning tomorrow. Build a new career in
                                                        delivery service with us.
                                                </p>
                                        </div>
                                        <Button
                                                asChild
                                                variant="brand"
                                                className="mt-7 h-11 rounded-full font-semibold shadow-sm hover:shadow-md transition-shadow"
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
