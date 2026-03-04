"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type { FaqItem } from "@/constants";

type FaqAccordionProps = {
  items: FaqItem[];
};

export default function FaqAccordion({ items }: FaqAccordionProps) {
  const defaultValue = items[0]?.id ?? "";
  return (
    <div className="mx-auto w-full max-w-3xl text-left">
      <Accordion type="single" collapsible defaultValue={defaultValue}>
        {items.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-base text-brand-grey">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

