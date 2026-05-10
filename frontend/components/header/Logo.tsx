"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Logo } from "@/constants";
import Image from "next/image";
import Link from "next/link";

export default function LogoComponent() {
        const { theme } = useClientTheme();
        return (
                <Link
                        href="/"
                        prefetch={true}
                        className={`flex items-center transition-colors ${
                                theme === "dark" ? "rounded-full bg-white/92 px-3 py-1.5 shadow-sm ring-1 ring-black/5" : ""
                        }`}
                >
                        <Image src={Logo} alt="FoodEats Logo" width={120} height={40} className="h-8 w-auto" priority />
                </Link>
        );
}
