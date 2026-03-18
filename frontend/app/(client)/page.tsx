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
                <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                        {/* 1. HERO SECTION (Full Width) */}
                        <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
                                <HeroSearchSection />
                        </section>

                        {/* 2. FEATURED FOODS SECTION (Container) */}
                        <section className="container mx-auto px-4 pt-12 pb-10 max-w-7xl">
                                <Suspense fallback={<GlobalLoader fullscreen={false} label="Loading" sublabel="Loading featured foods" />}>
                                        <FeaturedFoodPanel />
                                </Suspense>
                        </section>

                        {/* 3. VALUE PROPS */}
                        <section className="relative">
                                {/* Section divider (clear) */}
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                                <div className="bg-gray-50 border-t border-gray-200">
                                        <div className="container mx-auto px-4 pt-12 pb-16 max-w-7xl">
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
