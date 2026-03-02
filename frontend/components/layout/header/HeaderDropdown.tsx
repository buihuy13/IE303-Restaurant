"use client";

import clsx from "clsx";
import type { ReactNode } from "react";
import { useState } from "react";

type HeaderDropdownProps = {
  trigger: (args: { isOpen: boolean; toggle: () => void }) => ReactNode;
  children: (args: { close: () => void }) => ReactNode;
  align?: "left" | "right";
  widthClass?: string;
  className?: string;
};

export function HeaderDropdown({
  trigger,
  children,
  align = "left",
  widthClass = "w-72",
  className,
}: HeaderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((open) => !open);
  const close = () => setIsOpen(false);

  return (
    <div className={clsx("relative hidden lg:block", className)}>
      {trigger({ isOpen, toggle })}
      {isOpen ? (
        <div
          className={clsx(
            "absolute top-full z-50 mt-2 rounded-md border border-stroke bg-white shadow-lg",
            widthClass,
            align === "right" ? "right-0" : "left-0",
          )}
        >
          {children({ close })}
        </div>
      ) : null}
    </div>
  );
}

