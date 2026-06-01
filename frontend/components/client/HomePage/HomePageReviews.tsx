"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import Slider from "./Slider";

const HomePageReviews = () => {
        const { theme } = useClientTheme();
        return (
                <section
                        className={`mt-0 pb-24 lg:pb-[100px] ${
                                theme === "dark"
                                        ? "bg-gradient-to-b from-black/10 via-black/5 to-transparent"
                                        : "bg-gradient-to-b from-[#FFCF54] via-[#FFCF54]/80 to-white"
                        }`}
                >
                        <div className="custom-container px-4 lg:px-0 pt-16 md:pt-20 lg:pt-[100px]">
                                {/* Title */}
                                <div className="text-center lg:text-left">
                                        <h2
                                                className={`text-[28px] md:text-4xl font-bold tracking-tight max-w-[620px] mx-auto lg:mx-0 leading-tight ${
                                                        theme === "dark" ? "text-white" : "text-gray-900"
                                                }`}
                                        >
                                                What food lovers are saying about us
                                        </h2>
                                </div>

                                {/* Slider */}
                                <div className="mt-10 md:mt-12 lg:mt-[69px]">
                                        <Slider />
                                </div>
                        </div>
                </section>
        );
};

export default HomePageReviews;
