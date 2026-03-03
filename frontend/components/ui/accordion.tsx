"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import clsx from "clsx";

type AccordionType = "single" | "multiple";

type AccordionContextValue = {
  type: AccordionType;
  collapsible: boolean;
  openItems: Set<string>;
  toggleItem: (value: string) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

type AccordionProps = {
  children: ReactNode;
  type?: AccordionType;
  collapsible?: boolean;
  defaultValue?: string;
  className?: string;
};

export function Accordion({
  children,
  type = "single",
  collapsible = false,
  defaultValue,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(
    () => (defaultValue ? new Set([defaultValue]) : new Set()),
  );

  const toggleItem = (value: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      const isOpen = next.has(value);

      if (type === "single") {
        if (isOpen) {
          if (collapsible) {
            next.delete(value);
          }
        } else {
          next.clear();
          next.add(value);
        }
      } else {
        if (isOpen) {
          next.delete(value);
        } else {
          next.add(value);
        }
      }

      return next;
    });
  };

  return (
    <AccordionContext.Provider value={{ type, collapsible, openItems, toggleItem }}>
      <div className={className}>{children}</div>
    </AccordionContext.Provider>
  );
}

type AccordionItemContextValue = {
  value: string;
};

const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

const useAccordionContext = () => {
  const ctx = useContext(AccordionContext);
  if (!ctx) {
    throw new Error("Accordion components must be used within <Accordion>");
  }
  return ctx;
};

const useAccordionItemContext = () => {
  const ctx = useContext(AccordionItemContext);
  if (!ctx) {
    throw new Error("AccordionItem children must be used within <AccordionItem>");
  }
  return ctx;
};

type AccordionItemProps = {
  value: string;
  children: ReactNode;
};

export function AccordionItem({ value, children }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className="border-b border-gray-200">{children}</div>
    </AccordionItemContext.Provider>
  );
}

type AccordionTriggerProps = {
  children: ReactNode;
  className?: string;
};

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const { toggleItem, openItems } = useAccordionContext();
  const { value } = useAccordionItemContext();
  const isOpen = openItems.has(value);

  return (
    <button
      type="button"
      onClick={() => toggleItem(value)}
      className={clsx(
        "flex w-full items-center justify-between py-4 text-left text-base",
        "font-medium text-gray-900 hover:text-gray-700",
        className,
      )}
    >
      <span>{children}</span>
      <span className="ml-2 text-xl leading-none">{isOpen ? "−" : "+"}</span>
    </button>
  );
}

type AccordionContentProps = {
  children: ReactNode;
  className?: string;
};

export function AccordionContent({ children, className }: AccordionContentProps) {
  const { openItems } = useAccordionContext();
  const { value } = useAccordionItemContext();
  const isOpen = openItems.has(value);

  return (
    <div
      className={clsx(
        "overflow-hidden text-sm text-gray-600 transition-all",
        isOpen ? "max-h-[500px] opacity-100 pb-4" : "max-h-0 opacity-0",
        className,
      )}
    >
      {isOpen && children}
    </div>
  );
}

