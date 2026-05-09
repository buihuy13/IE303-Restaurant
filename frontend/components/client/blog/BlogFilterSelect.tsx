"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

interface BlogFilterSelectOption {
    value: string;
    label: string;
}

interface BlogFilterSelectProps {
    label: string;
    value: string;
    options: BlogFilterSelectOption[];
    onChange: (value: string) => void;
}

export function BlogFilterSelect({ label, value, options, onChange }: BlogFilterSelectProps) {
    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const listboxId = useId();
    const selectedOption = options.find((option) => option.value === value) ?? options[0];

    useEffect(() => {
        const handlePointerDown = (event: PointerEvent) => {
            if (!rootRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const handleSelect = (nextValue: string) => {
        onChange(nextValue);
        setOpen(false);
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={listboxId}
                onClick={() => setOpen((current) => !current)}
                onKeyDown={(event) => {
                    if (event.key === "Escape") setOpen(false);
                }}
                className="flex h-12 w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 text-left text-sm text-gray-900 outline-none transition hover:border-gray-400 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20"
            >
                <span className="truncate">{selectedOption?.label ?? label}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    id={listboxId}
                    role="listbox"
                    aria-label={label}
                    className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                >
                    {options.map((option) => {
                        const selected = option.value === value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                role="option"
                                aria-selected={selected}
                                onClick={() => handleSelect(option.value)}
                                className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                            >
                                <span className="truncate">{option.label}</span>
                                {selected && <Check className="h-4 w-4 text-brand-orange" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
