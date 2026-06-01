 "use client";

import type { Address } from "@/types";
import { MapPin, Trash2 } from "lucide-react";

export function AddressesList(props: { addresses: Address[]; onDelete: (addressId: string) => void }) {
    const { addresses, onDelete } = props;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
                <div
                    key={address.id}
                    className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-white"
                >
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="w-5 h-5 text-brand-orange" />
                                <h3 className="font-semibold text-gray-800">Address</h3>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{address.location}</p>
                            {address.longitude && address.latitude && (
                                <p className="text-xs text-gray-400">
                                    Coordinates: {address.latitude.toFixed(4)}, {address.longitude.toFixed(4)}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => onDelete(address.id)}
                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                            title="Delete address"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

