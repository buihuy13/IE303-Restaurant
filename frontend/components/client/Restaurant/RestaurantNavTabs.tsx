// File: app/_components/client/Restaurant/RestaurantNavTabs.tsx
"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

const navLinks = [
        { name: "Menu", href: "#menu" },
        { name: "About", href: "#about" },
        { name: "Reviews", href: "#reviews" },
];

export default function RestaurantNavTabs() {
        const [isSticky, setSticky] = useState(false);

        useEffect(() => {
                const handleScroll = () => {
                        // Account for new banner height (350px desktop) + overlapping card (~120px)
                        const heroHeight = window.innerWidth >= 768 ? 470 : 370;
                        if (window.scrollY > heroHeight) setSticky(true);
                        else setSticky(false);
                };
                window.addEventListener("scroll", handleScroll);
                return () => window.removeEventListener("scroll", handleScroll);
        }, []);

        const [activeTab, setActiveTab] = useState("Menu");

        useEffect(() => {
                const handleHashChange = () => {
                        const hash = window.location.hash.slice(1);
                        if (hash === "menu") setActiveTab("Menu");
                        else if (hash === "about") setActiveTab("About");
                        else if (hash === "reviews") setActiveTab("Reviews");
                };

                handleHashChange();
                window.addEventListener("hashchange", handleHashChange);
                return () => window.removeEventListener("hashchange", handleHashChange);
        }, []);

        return (
                <div
                        className={cn(
                                "transition-all duration-300 z-30 border-b border-gray-200/70",
                                isSticky
                                        ? "sticky top-0 bg-white/80 backdrop-blur-xl border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                                        : "relative bg-white/90 backdrop-blur-sm border-gray-200/70"
                        )}
                >
                        <div className="custom-container">
                                <nav className="flex items-center gap-x-2 md:gap-x-3 py-2">
                                        {navLinks.map((link) => {
                                                const isActive = activeTab === link.name;
                                                return (
                                                        <a
                                                                key={link.name}
                                                                href={link.href}
                                                                onClick={() => setActiveTab(link.name)}
                                                                className={cn(
                                                                        "px-3 py-2 rounded-full text-sm font-semibold transition-all duration-200 relative",
                                                                        isActive
                                                                                ? "bg-brand-orange/10 text-brand-orange ring-1 ring-brand-orange/30"
                                                                                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 ring-1 ring-transparent"
                                                                )}
                                                        >
                                                                {link.name}
                                                        </a>
                                                );
                                        })}
                                </nav>
                        </div>
                </div>
        );
}
