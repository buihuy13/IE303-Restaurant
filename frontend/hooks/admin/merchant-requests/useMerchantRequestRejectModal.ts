import { useState } from "react";
import type { User } from "@/types";

export function useMerchantRequestRejectModal() {
    const [open, setOpen] = useState(false);
    const [target, setTarget] = useState<User | null>(null);
    const [reason, setReason] = useState("");

    const openReject = (request: User) => {
        setTarget(request);
        setReason("");
        setOpen(true);
    };

    const closeReject = () => {
        setOpen(false);
        setTarget(null);
        setReason("");
    };

    return { open, target, reason, setReason, openReject, closeReject };
}
