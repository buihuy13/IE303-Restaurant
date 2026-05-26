"use client";

import { GroupOrderUnavailable } from "@/components/client/group-orders/GroupOrderUnavailable";
import { Restaurant } from "@/types";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";

interface CreateGroupOrderModalProps {
    restaurant: Restaurant;
    isOpen: boolean;
    onClose: () => void;
}

export default function CreateGroupOrderModal({ restaurant, isOpen, onClose }: CreateGroupOrderModalProps) {
    void restaurant;
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        const scrollY = window.scrollY;
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = "100%";
        document.body.style.overflow = "hidden";

        return () => {
            const top = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (top) {
                window.scrollTo(0, parseInt(top, 10) * -1);
            }
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">Group Order</h2>
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="rounded-full hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </Button>
                </div>
                <div className="p-6">
                    <GroupOrderUnavailable />
                </div>
            </div>
        </div>,
        document.body,
    );
}
