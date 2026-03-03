"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { faqItems } from "@/constants";

export default function FaqAccordion() {
  return (
    <div className="w-full max-w-3xl mx-auto text-left">
      <Accordion type="single" collapsible defaultValue="item-1">
        {faqItems.map((faq) => (
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

