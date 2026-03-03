import Image from "next/image";

import { FoodEat } from "@/constants";

export default function ContactHero() {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <h1 className="font-roboto-serif text-3xl md:text-5xl font-semibold">
        Let&apos;s talk with us for any issues or problem
      </h1>

      <div className="relative w-full max-w-sm mx-auto mt-8 h-64">
        <Image
          src={FoodEat}
          alt="Contact Illustration"
          fill
          className="object-contain"
        />
      </div>
    </div>
  );
}

