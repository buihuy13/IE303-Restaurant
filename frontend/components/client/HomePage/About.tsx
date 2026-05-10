"use client";

import foodeat from "@/assets/HomePage/foodeat.png";
import leaf from "@/assets/HomePage/leaf.png";
import pizza from "@/assets/HomePage/pizza.png";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import ScrollReveal from "@/components/client/animations/ScrollReveal";
import { Variants } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const slideInFromLeft: Variants = { hidden: { opacity: 0, x: -100 }, visible: { opacity: 1, x: 0 } };
const slideInFromRight: Variants = { hidden: { opacity: 0, x: 100 }, visible: { opacity: 1, x: 0 } };
const HomePageAbout = () => {
        const { theme } = useClientTheme();
        return (
                <section
                        className={`mt-10 relative px-4 py-6 lg:p-0 lg:pb-[80px] ${
                                theme === "dark" ? "bg-transparent" : "bg-brand-yellowlight"
                        }`}
                >
                        <div className="custom-container">
                                {/* Top about */}
                                <div
                                        className={`grid grid-cols-2 md:grid-cols-4 gap-y-7 md:gap-y-8 text-center md:text-left md:justify-items-center items-center py-8 md:py-10 px-4 md:px-5 text-brand-white overflow-hidden relative -top-8 md:-top-10 lg:-top-[60px] rounded-2xl ring-1 ${
                                                theme === "dark"
                                                        ? "bg-black/25 border border-white/10 shadow-[0_20px_60px_rgba(2,6,25,0.45)]"
                                                        : "bg-brand-black shadow-xl ring-white/10"
                                        }`}
                                >
                                        <Image
                                                src={pizza}
                                                alt="pizza Image"
                                                width={100}
                                                height={100}
                                                className="absolute -top-[50%] translate-y-[50%] left-0 -translate-x-[50%] object-cover hidden md:block"
                                        />
                                        <Image
                                                src={leaf}
                                                alt="leaf Image"
                                                width={100}
                                                height={100}
                                                className="absolute translate-y-[50%] right-0 translate-x-[50%] object-cover hidden md:block"
                                        />

                                        {/* Order per minute */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold leading-tight">350+</h2>
                                                <p className="mt-1.5 md:mt-[14px] text-sm md:text-base font-manrope font-medium leading-relaxed text-white/85">
                                                        Order per minute
                                                </p>
                                        </div>

                                        {/* Faster delivery */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold leading-tight">10x</h2>
                                                <p className="mt-1.5 md:mt-[14px] text-sm md:text-base font-manrope font-medium leading-relaxed text-white/85">
                                                        Faster delivery
                                                </p>
                                        </div>

                                        {/* InCountry */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold leading-tight">10+</h2>
                                                <p className="mt-1.5 md:mt-[14px] text-sm md:text-base font-manrope font-medium leading-relaxed text-white/85">
                                                        In Country
                                                </p>
                                        </div>

                                        {/* Order accuracy */}
                                        <div className="flex flex-col">
                                                <h2 className="font-roboto-serif text-3xl md:text-4xl font-semibold leading-tight">
                                                        99.9%
                                                </h2>
                                                <p className="mt-1.5 md:mt-[14px] text-sm md:text-base font-manrope font-medium leading-relaxed text-white/85">
                                                        Order accuracy
                                                </p>
                                        </div>
                                </div>

                                {/* Main About */}

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-12 lg:gap-[110px] items-center">
                                        {/* Image container */}

                                        <ScrollReveal variants={slideInFromLeft}>
                                                <div className="w-full h-[350px] md:h-[500px] lg:h-[594px] relative">
                                                        <Image
                                                                src={foodeat}
                                                                alt="foodeat Image"
                                                                fill
                                                                className={`object-cover rounded-2xl shadow-lg ring-1 ${
                                                                        theme === "dark" ? "ring-white/10" : "ring-black/5"
                                                                }`}
                                                        />
                                                </div>
                                        </ScrollReveal>

                                        {/* Text content */}

                                        <ScrollReveal variants={slideInFromRight} delay={0.2}>
                                                <div className="text-center lg:text-left px-1 md:px-0">
                                                        <h2
                                                                className={`text-[28px] md:text-4xl font-bold tracking-tight leading-tight ${
                                                                        theme === "dark" ? "text-white" : "text-gray-900"
                                                                }`}
                                                        >
                                                                About <strong>Foodeats</strong>
                                                        </h2>
                                                        <p className={`mt-4 text-[15px] md:text-base leading-7 ${theme === "dark" ? "text-white/76" : "text-gray-700/90"}`}>
                                                                <strong> Foodeats</strong> helps you find and order food
                                                                from wherever you are. How it works: you type in an
                                                                address, we tell you the restaurants that deliver to
                                                                that locale as well as showing you droves of pickup
                                                                restaurants near you.
                                                        </p>

                                                        <p className={`mt-4 text-[15px] md:text-base leading-7 ${theme === "dark" ? "text-white/76" : "text-gray-700/90"}`}>
                                                                Want to be more specific? Search by cuisine, restaurant
                                                                name or menu item. We&apos;ll filter your results
                                                                accordingly.
                                                        </p>

                                                        <Button asChild variant="brand" className="mt-8 h-11 rounded-full px-7 font-semibold shadow-sm hover:shadow-md">
                                                                <Link href="/?type=foods" className="inline-block">
                                                                        Explore Food
                                                                </Link>
                                                        </Button>
                                                </div>
                                        </ScrollReveal>
                                </div>
                        </div>
                </section>
        );
};

export default HomePageAbout;
