"use client";

import Image from "next/image";

import { FoodEat } from "@/constants";
import { useFaqPage } from "@/hooks/faq/useFaqPage";

import FaqAccordion from "./FaqAccordion";

export default function FaqPageShell() {
  const { title, items } = useFaqPage();

  return (
    <main className="bg-brand-white">
      <section className="py-16 lg:py-24">
        <div className="custom-container text-center">
          <h1 className="mx-auto max-w-2xl font-roboto-serif text-3xl font-semibold md:text-5xl">
            {title}
          </h1>

          <div className="relative mx-auto mt-8 h-48 w-full max-w-xs">
            <Image
              src={FoodEat}
              alt="FAQ Illustration"
              fill
              className="object-contain"
            />
          </div>

          <div className="mt-16">
            <FaqAccordion items={items} />
          </div>
        </div>
      </section>
    </main>
  );
}
