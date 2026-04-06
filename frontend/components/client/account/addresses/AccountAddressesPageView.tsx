"use client";
import AddressAutocomplete from "@/components/AddressAutocomplete";
import Button from "@/components/Button";
import { Address, AddressRequest } from "@/types";
import { Loader2, MapPin, Plus, Trash2 } from "lucide-react";

interface AccountAddressesPageViewProps {
    userId: string | null;
    addresses: Address[];
    loading: boolean;
    authLoading: boolean;
    mounted: boolean;
    isAdding: boolean;
    submitting: boolean;
    isLocating: boolean;
    newAddress: AddressRequest;
    onToggleAdd: () => void;
    onSubmit: (e: React.FormEvent) => void;
    onUseCurrentLocation: () => void;
    onAddressChange: (address: string, latitude: number, longitude: number) => void;
    onCancelAdd: () => void;
    onDeleteAddress: (addressId: string) => void;
}

export function AccountAddressesPageView({
    addresses,
    loading,
    authLoading,
    mounted,
    isAdding,
    submitting,
    isLocating,
    newAddress,
    onToggleAdd,
    onSubmit,
    onUseCurrentLocation,
    onAddressChange,
    onCancelAdd,
    onDeleteAddress,
}: AccountAddressesPageViewProps) {
    if (!mounted || authLoading || loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-gray-200/90 bg-white p-8 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6 rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">My Addresses</h1>
                    <p className="text-gray-500">Manage your delivery addresses</p>
                </div>
                <Button
                    onClickFunction={onToggleAdd}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-brand-orange text-white shadow-sm transition-shadow hover:bg-brand-orange/90 hover:shadow-md"
                >
                    <Plus size={20} />
                    {isAdding ? "Cancel" : "Add Address"}
                </Button>
            </div>

            {isAdding && (
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
                                    className="inline-flex items-center gap-2 rounded-xl border border-brand-orange/30 bg-brand-orange/10 px-3 py-2 text-sm font-semibold text-brand-orange hover:bg-brand-orange/15 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isLocating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <MapPin className="h-4 w-4" />
                                    )}
                                    Use Current Location
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <Button
                                type="submit"
                                className="cursor-pointer rounded-full bg-brand-orange text-white hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
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
                                onClickFunction={onCancelAdd}
                                className="cursor-pointer rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="border-t pt-6">
                {!addresses || addresses.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="mb-6">
                            <svg
                                width="120"
                                height="120"
                                viewBox="0 0 120 120"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className="mx-auto text-gray-300"
                            >
                                <circle cx="60" cy="60" r="50" fill="currentColor" opacity="0.1" />
                                <path
                                    d="M60 30C45.6406 30 34 41.6406 34 56C34 70.3594 60 90 60 90C60 90 86 70.3594 86 56C86 41.6406 74.3594 30 60 30ZM60 65C55.5817 65 52 61.4183 52 57C52 52.5817 55.5817 49 60 49C64.4183 49 68 52.5817 68 57C68 61.4183 64.4183 65 60 65Z"
                                    fill="currentColor"
                                    opacity="0.3"
                                />
                            </svg>
                        </div>
                        <p className="text-gray-800 text-lg font-semibold mb-2">No addresses saved yet</p>
                        <p className="text-gray-400 text-sm">Add your first address to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.isArray(addresses) &&
                            addresses.map((address) => (
                                <div
                                    key={address.id}
                                    className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
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
                                                    Coordinates: {address.latitude.toFixed(4)},{" "}
                                                    {address.longitude.toFixed(4)}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onDeleteAddress(address.id)}
                                            className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                                            title="Delete address"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
}

