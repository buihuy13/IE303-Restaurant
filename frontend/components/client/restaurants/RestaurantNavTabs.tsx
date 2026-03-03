"use client";

import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { id: "menu", label: "Menu" },
  { id: "about", label: "About" },
  { id: "reviews", label: "Reviews" },
];

export function RestaurantNavTabs() {
  const [isSticky, setIsSticky] = useState(false);
  const [activeId, setActiveId] = useState<string>("menu");

  useEffect(() => {
    const handleScroll = () => {
      const heroHeight = window.innerWidth >= 768 ? 420 : 340;
      setIsSticky(window.scrollY > heroHeight);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash && NAV_ITEMS.some((item) => item.id === hash)) {
        setActiveId(hash);
      }
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  return (
    <div
      className={`z-20 border-b border-gray-200 bg-white transition-all duration-300 ${
        isSticky ? "sticky top-0 shadow-lg" : "relative"
      }`}
    >
      <div className="custom-container">
        <nav className="flex items-center gap-x-4 md:gap-x-8">
          {NAV_ITEMS.map((item) => {
            const isActive = activeId === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveId(item.id)}
                className={`relative py-4 text-sm font-bold md:text-base ${
                  isActive
                    ? "text-[#EE4D2D]"
                    : "text-gray-500 hover:text-[#EE4D2D]"
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#EE4D2D]" />
                )}
              </a>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

