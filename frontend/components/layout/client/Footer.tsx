import { Logo, SocialIcons } from "@/constants";
import { Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-0 border-t border-gray-200 bg-gradient-to-b from-white via-orange-50/30 to-brand-yellowlight/55 py-10 md:py-12">
            <div className="custom-container">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-12">
                    {/* Left: Logo, Description, Social Icons */}
                    <div className="md:col-span-4 flex max-w-xs flex-col items-start">
                        <Link href="/" className="mb-3 flex items-center">
                            <Image src={Logo} alt="FoodEats Logo" />
                        </Link>
                        <p className="mb-5 text-sm leading-6 text-brand-grey font-manrope">
                            Food, Drinks, groceries, and more available for delivery and pickup.
                        </p>
                        <div className="flex space-x-2.5">
                            <a
                                href="#"
                                aria-label="Facebook"
                                className="flex items-center justify-center rounded-xl bg-brand-black p-2.5 transition hover:-translate-y-0.5 hover:bg-brand-purple"
                            >
                                <SocialIcons.Facebook size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                aria-label="LinkedIn"
                                className="flex items-center justify-center rounded-xl bg-brand-black p-2.5 transition hover:-translate-y-0.5 hover:bg-brand-purple"
                            >
                                <SocialIcons.Linkedin size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                aria-label="Twitter"
                                className="flex items-center justify-center rounded-xl bg-brand-black p-2.5 transition hover:-translate-y-0.5 hover:bg-brand-purple"
                            >
                                <SocialIcons.Twitter size={20} color="#fff" />
                            </a>
                            <a
                                href="#"
                                aria-label="Instagram"
                                className="flex items-center justify-center rounded-xl bg-brand-black p-2.5 transition hover:-translate-y-0.5 hover:bg-brand-purple"
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
                                <h5 className="mb-4 text-base font-semibold text-brand-black">Get Started</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            FoodEats Sign In
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            FoodEats Sign Up
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Become a Rider
                                        </a>
                                    </li>
                                    <li>
                                        <Link
                                            href="/register?type=merchant"
                                            className="flex items-center gap-1 text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            <Store className="w-4 h-4" />
                                            Sell with FoodEats
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* Get Help */}
                            <div>
                                <h5 className="mb-4 text-base font-semibold text-brand-black">Get Help</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <Link
                                            href="/under-development"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Resources
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/under-development"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Support
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/contact"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Contact Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/FAQ"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            FAQ
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* Company */}
                            <div>
                                <h5 className="mb-4 text-base font-semibold text-brand-black">Company</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <Link
                                            href="/about"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            About Us
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/under-development"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Customer Rights
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/under-development"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Career
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/under-development"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Press
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            href="/blog"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Blog
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                            {/* FoodEats For */}
                            <div>
                                <h5 className="mb-4 text-base font-semibold text-brand-black">FoodEats For</h5>
                                <ul className="space-y-2.5 text-sm text-gray-600">
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Enterprise
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            For Small Business
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Personal
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="#"
                                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                                        >
                                            Riders
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Bottom section */}

                <div className="mt-10 flex w-full flex-col border-t border-gray-300/80 pt-6 text-sm text-gray-600 md:flex-row md:items-center md:justify-between">
                    <p className="w-full text-center text-sm text-brand-grey font-manrope md:w-auto md:text-left">
                        Copyright © 2022 UBILUT All rights reserved.
                    </p>
                    <div className="mt-2 flex w-full flex-col space-y-2 text-center md:mt-0 md:w-auto md:flex-row md:justify-end md:space-y-0 md:space-x-6 md:text-right">
                        <Link
                            href="/under-development"
                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                        >
                            Privacy Policy
                        </Link>
                        <Link
                            href="/under-development"
                            className="text-sm text-brand-grey font-manrope transition-colors hover:text-brand-orange"
                        >
                            Terms & Conditions
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
