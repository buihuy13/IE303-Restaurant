// File: app/page.tsx
"use client";

import FeaturedFoodPanel from "@/components/client/HomePage/FeaturedFoodPanel";
import HeroSearchSection from "@/components/client/HomePage/HeroSearchSection";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Suspense } from "react";

export default function HomePage() {
        return (
                <main className="min-h-screen bg-gray-50">
                        {/* 1. HERO SECTION (Full Width) */}
                        <section className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
                                <HeroSearchSection />
                        </section>

                        {/* 2. FEATURED FOODS SECTION (Container) */}
                        <section className="container mx-auto px-4 py-12 max-w-7xl">
                                <Suspense fallback={<GlobalLoader label="Loading" sublabel="Loading food list" />}>
                                        <FeaturedFoodPanel />
                                </Suspense>
                        </section>
                </main>
        );
}
