"use client";

import { Construction, Rocket } from "lucide-react";
import Link from "next/link";

import { useUnderDevelopmentPage } from "@/hooks/under-development/useUnderDevelopmentPage";

export default function UnderDevelopmentPageShell() {
  const {
    title,
    description,
    comingTitle,
    comingDescription,
    primaryLink,
    secondaryLink,
    footerText,
    footerLink,
  } = useUnderDevelopmentPage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-full max-w-2xl text-center">
        <div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-orange-200 opacity-50 blur-xl" />
              <div className="relative rounded-full bg-linear-to-br from-orange-400 to-orange-600 p-6">
                <Construction className="h-16 w-16 text-white" />
              </div>
            </div>
          </div>

          <h1 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
            {title}
          </h1>

          <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">
            {description}
          </p>

          <div className="mb-8 rounded-lg border border-orange-200 bg-orange-50 p-6">
            <div className="flex items-start gap-4">
              <Rocket className="mt-1 h-6 w-6 shrink-0 text-orange-600" />
              <div className="text-left">
                <h3 className="mb-2 font-semibold text-gray-900">{comingTitle}</h3>
                <p className="text-sm text-gray-700">{comingDescription}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href={primaryLink.href}
              className="rounded-lg bg-[#EE4D2D] px-6 py-3 font-medium text-white shadow-md transition-colors hover:bg-[#EE4D2D]/90 hover:shadow-lg"
            >
              {primaryLink.label}
            </Link>
            <Link
              href={secondaryLink.href}
              className="rounded-lg border-2 border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {secondaryLink.label}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          {footerText}{" "}
          <Link
            href={footerLink.href}
            className="font-medium text-[#EE4D2D] hover:underline"
          >
            {footerLink.label}
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
