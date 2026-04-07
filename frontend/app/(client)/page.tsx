// File: app/page.tsx
"use client";

import FeaturedFoodPanel from "@/components/client/HomePage/FeaturedFoodPanel";
import HeroSearchSection from "@/components/client/HomePage/HeroSearchSection";
import HomePageAbout from "@/components/client/HomePage/About";
import FeaturesAction from "@/components/client/HomePage/FeaturesAction";
import HomePageReviews from "@/components/client/HomePage/HomePageReviews";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Suspense } from "react";

export default function HomePage() {
        return (
                <main className="min-h-screen bg-gradient-to-b from-slate-50 via-gray-50 to-white">
                        {/* 1. HERO SECTION (Full Width) */}
                        <section className="relative flex h-[520px] w-full items-center justify-center md:h-[620px]">
                                <HeroSearchSection />
                        </section>

                        {/* 2. FEATURED FOODS SECTION (Container) */}
                        <section className="custom-container pb-12 pt-14 md:pt-16">
                                <Suspense fallback={<GlobalLoader fullscreen={false} label="Loading" sublabel="Loading featured foods" />}>
                                        <FeaturedFoodPanel />
                                </Suspense>
                        </section>

                        {/* 3. VALUE PROPS */}
                        <section className="relative">
                                {/* Section divider (clear) */}
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                <div className="border-y border-gray-200 bg-white/70 backdrop-blur-[2px]">
                                        <div className="custom-container pb-16 pt-12 md:pb-20 md:pt-14">
                                                <FeaturesAction />
                                        </div>
                                        {/* Bottom separator to transition into next section */}
                                        <div className="pointer-events-none h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
                                </div>
                        </section>

                        {/* 4. ABOUT */}
                        <HomePageAbout />

                        {/* 5. REVIEWS */}
                        <HomePageReviews />
                </main>
        );
}
