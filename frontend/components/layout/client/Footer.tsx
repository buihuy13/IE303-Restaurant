import { Logo, SocialIcons } from "@/constants";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    const { theme } = useClientTheme();
    const headingClass = theme === "dark" ? "text-white/92" : "text-brand-black";
    const linkClass = theme === "dark"
        ? "text-sm text-white/68 font-manrope transition-colors hover:text-white"
        : "text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange";

    return (
        <footer
            className={`mt-0 border-t py-10 md:py-12 ${
                theme === "dark"
                    ? "border-white/10 bg-gradient-to-b from-[#0f1425] via-[#10182d] to-[#0c1222]"
                    : "border-gray-200 bg-gradient-to-b from-white via-orange-50/30 to-brand-yellowlight/55"
            }`}
        >
            <div className="custom-container">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
                    {/* Left: Logo, Description, Social Icons */}
                    <div className="md:col-span-4 flex max-w-xs flex-col items-start">
                        <Link
                            href="/"
                            className={`mb-3 flex items-center ${theme === "dark" ? "rounded-full bg-white/92 px-3 py-1.5 shadow-sm ring-1 ring-black/5" : ""}`}
                        >
                            <Image src={Logo} alt="FoodEats Logo" />
                        </Link>
                        <p className={`mb-5 text-sm leading-6 font-manrope ${theme === "dark" ? "text-white/66" : "text-brand-grey"}`}>
                            Food, Drinks, groceries, and more available for delivery and pickup.
                        </p>
                        <div className="flex space-x-2.5">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className={`flex items-center justify-center rounded-xl p-2.5 transition hover:-translate-y-0.5 ${
                                    theme === "dark" ? "bg-white/10 hover:bg-white/16" : "bg-brand-black hover:bg-brand-purple"
                                }`}
                            >
                                <SocialIcons.Facebook size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                aria-label="LinkedIn"
                                className={`flex items-center justify-center rounded-xl p-2.5 transition hover:-translate-y-0.5 ${
                                    theme === "dark" ? "bg-white/10 hover:bg-white/16" : "bg-brand-black hover:bg-brand-purple"
                                }`}
                            >
                                <SocialIcons.Linkedin size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                aria-label="Twitter"
                                className={`flex items-center justify-center rounded-xl p-2.5 transition hover:-translate-y-0.5 ${
                                    theme === "dark" ? "bg-white/10 hover:bg-white/16" : "bg-brand-black hover:bg-brand-purple"
                                }`}
                            >
                                <SocialIcons.Twitter size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                className={`flex items-center justify-center rounded-xl p-2.5 transition hover:-translate-y-0.5 ${
                                    theme === "dark" ? "bg-white/10 hover:bg-white/16" : "bg-brand-black hover:bg-brand-purple"
                                }`}
                            >
                                <SocialIcons.Instagram size={20} color="#fff" />
                            </a>
                        </div>
                    </div>
                    {/* Right: 4 menu columns */}
                    <div className="md:col-span-8">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
                            {/* Get Started */}
                            <div>
                                <h5 className={`mb-4 text-base font-semibold ${headingClass}`}>Get Started</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <a href="#" className={linkClass}>
                                            FoodEats Sign In
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className={linkClass}>
                                            FoodEats Sign Up
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className={linkClass}>
                                            Become a Rider
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            href="/register?type=merchant"
                                            className={`flex items-center gap-1 ${linkClass}`}
                                        >
                                            <Store className="w-4 h-4" />
                                            Sell with FoodEats
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* Get Help */}
                            <div>
                                <h5 className={`mb-4 text-base font-semibold ${headingClass}`}>Get Help</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <Link href="/under-development" className={linkClass}>
                                            Resources
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/under-development" className={linkClass}>
                                            Support
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/contact" className={linkClass}>
                                            Contact Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/FAQ" className={linkClass}>
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* Company */}
                            <div>
                                <h5 className={`mb-4 text-base font-semibold ${headingClass}`}>Company</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <Link href="/about" className={linkClass}>
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/under-development" className={linkClass}>
                                            Customer Rights
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/under-development" className={linkClass}>
                                            Career
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/under-development" className={linkClass}>
                                            Press
                                        </Link>
                                    </li>
                                    <li>
                                        <Link href="/blog" className={linkClass}>
                                            Blog
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* FoodEats For */}
                            <div>
                                <h5 className={`mb-4 text-base font-semibold ${headingClass}`}>FoodEats For</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <a href="#" className={linkClass}>
                                            Enterprise
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className={linkClass}>
                                            For Small Business
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className={linkClass}>
                                            Personal
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#" className={linkClass}>
                                            Riders
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bottom section */}

                <div className={`mt-10 flex w-full flex-col border-t pt-6 text-sm md:flex-row md:items-center md:justify-between ${
                    theme === "dark" ? "border-white/12 text-white/62" : "border-gray-300/80 text-gray-600"
                }`}>
                    <p className={`w-full text-center text-sm font-manrope md:w-auto md:text-left ${theme === "dark" ? "text-white/55" : "text-brand-grey"}`}>
                        Copyright © 2022 UBILUT All rights reserved.
                    </p>
                    <div className="mt-2 flex w-full flex-col space-y-2 text-center md:mt-0 md:w-auto md:flex-row md:justify-end md:space-y-0 md:space-x-6 md:text-right">
                        <Link href="/under-development" className={linkClass}>
                            Privacy Policy
                        </Link>
                        <Link href="/under-development" className={linkClass}>
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
