 "use client";

import AddressAutocomplete from "@/components/AddressAutocomplete";
import Button from "@/components/Button";
import type { AddressRequest } from "@/types";
import { Loader2, MapPin } from "lucide-react";

export function AddressesAddForm(props: {
    newAddress: AddressRequest;
    submitting: boolean;
    isLocating: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    onAddressChange: (address: string, latitude: number, longitude: number) => void;
    onUseCurrentLocation: () => void;
}) {
    const { newAddress, submitting, isLocating, onSubmit, onCancel, onAddressChange, onUseCurrentLocation } = props;

    return (
        <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
            <form onSubmit={onSubmit} className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Address <span className="text-red-500">*</span>
                    </label>
                    <AddressAutocomplete
                        value={newAddress.location}
                        onChange={onAddressChange}
                        placeholder="Enter address (e.g., 123 Main Street, Ho Chi Minh City)..."
                        disabled={submitting}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                        Enter an address and select from suggestions. Coordinates will be automatically retrieved.
                    </p>

                    {(newAddress.latitude !== 0 || newAddress.longitude !== 0) && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-xs text-green-700">
                                <span className="font-semibold">Coordinates retrieved:</span> Lat:{" "}
                                {newAddress.latitude.toFixed(6)}, Lng: {newAddress.longitude.toFixed(6)}
                            </p>
                        </div>
                    )}

                    <div className="mt-3">
                        <button
                            type="button"
                            onClick={onUseCurrentLocation}
                            disabled={submitting || isLocating}
                            className="inline-flex items-center gap-2 rounded-md border border-[#EE4D2D]/30 bg-[#EE4D2D]/10 px-3 py-2 text-sm font-semibold text-[#EE4D2D] hover:bg-[#EE4D2D]/15 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                            Use Current Location
                        </button>
                    </div>
                </div>
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        className="bg-[#EE4D2D] text-white hover:bg-[#EE4D2D]/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={submitting}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                Adding...
                            </>
                        ) : (
                            "Add Address"
                        )}
                    </Button>
                    <Button
                        type="button"
                        onClickFunction={onCancel}
                        className="bg-gray-100 text-gray-800 hover:bg-gray-200 cursor-pointer"
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

