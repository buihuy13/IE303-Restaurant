 "use client";

import Button from "@/components/Button";
import { Plus } from "lucide-react";

export function AddressesHeader(props: { isAdding: boolean; onToggleAdding: () => void }) {
    const { isAdding, onToggleAdding } = props;

    return (
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold mb-2">My Addresses</h1>
                <p className="text-gray-500">Manage your delivery addresses</p>
            </div>
            <Button
                onClickFunction={onToggleAdding}
                className="bg-brand-orange text-white hover:bg-brand-orange/90 cursor-pointer flex items-center gap-2"
            >
                <Plus size={20} />
                {isAdding ? "Cancel" : "Add Address"}
            </Button>
        </div>
    );
}

