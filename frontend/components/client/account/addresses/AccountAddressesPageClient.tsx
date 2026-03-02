"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AccountAddressesPageView } from "@/components/client/Account/addresses/AccountAddressesPageView";
import { useConfirm } from "@/components/ui/ConfirmModal";
import { authApi } from "@/lib/api/authApi";
import { useAuthStore } from "@/stores/useAuthStore";
import { Address, AddressRequest } from "@/types";

export default function AccountAddressesPageClient() {
    const { user, loading: authLoading } = useAuthStore();
    const confirmAction = useConfirm();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [newAddress, setNewAddress] = useState<AddressRequest>({
        location: "",
        longitude: 0,
        latitude: 0,
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    const fetchAddresses = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const data = await authApi.getUserAddresses(user.id);
            if (Array.isArray(data)) {
                setAddresses(data);
            } else {
                console.warn("Addresses data is not an array:", data);
                setAddresses([]);
            }
        } catch (error) {
            console.error("Error fetching addresses:", error);
            let errorMessage = "Failed to load addresses";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
            setAddresses([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (mounted && user?.id && !authLoading) {
            fetchAddresses();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, user?.id, authLoading]);

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error("User information not available");
            return;
        }

        if (!newAddress.location.trim()) {
            toast.error("Please enter an address");
            return;
        }

        if (!newAddress.latitude || !newAddress.longitude || newAddress.latitude === 0 || newAddress.longitude === 0) {
            toast.error("Please select an address from the suggestions to automatically get coordinates");
            return;
        }

        setSubmitting(true);
        try {
            await authApi.addAddress(user.id, {
                ...newAddress,
            });
            toast.success("Address added successfully!");
            setNewAddress({ location: "", longitude: 0, latitude: 0 });
            setIsAdding(false);
            fetchAddresses();
        } catch (error) {
            let errorMessage = "Failed to add address";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleUseCurrentLocation = async () => {
        if (submitting || isLocating) {
            return;
        }

        if (typeof window === "undefined" || !navigator?.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLocating(true);

        try {
            const coords = await new Promise<GeolocationCoordinates>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (pos) => resolve(pos.coords),
                    (err) => reject(err),
                    {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 30000,
                    },
                );
            });

            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.latitude}&lon=${coords.longitude}&zoom=18&addressdetails=1&accept-language=en`,
                    {
                        headers: {
                            "User-Agent": "FoodEats/1.0",
                        },
                    },
                );
                const data = await response.json();

                let addressText = "";
                if (data.address) {
                    const address = data.address;
                    const parts: string[] = [];
                    if (address.house_number) parts.push(address.house_number);
                    if (address.road) parts.push(address.road);
                    if (address.suburb || address.neighbourhood) parts.push(address.suburb || address.neighbourhood);
                    if (address.city || address.town || address.village)
                        parts.push(address.city || address.town || address.village);
                    if (address.state) parts.push(address.state);
                    addressText = parts.length > 0 ? parts.join(", ") : data.display_name || "";
                } else if (data.display_name) {
                    addressText = data.display_name;
                }

                if (addressText) {
                    setNewAddress({
                        location: addressText,
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    });
                    toast.success("Current location retrieved successfully!");
                } else {
                    setNewAddress({
                        location: "",
                        latitude: coords.latitude,
                        longitude: coords.longitude,
                    });
                    toast.success("Coordinates retrieved. Please enter an address.");
                }
            } catch (geocodeError) {
                console.error("Reverse geocoding failed:", geocodeError);
                setNewAddress({
                    location: "",
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                toast.success("Coordinates retrieved. Please enter an address.");
            }
        } catch (error) {
            const geoError = error as { code?: number; message?: string };
            if (geoError?.code === 1) {
                toast.error("Location permission denied. Please allow location access and try again.");
            } else if (geoError?.code === 2) {
                toast.error("Unable to determine location. Please try again.");
            } else if (geoError?.code === 3) {
                toast.error("Location request timed out. Please try again.");
            } else {
                toast.error(geoError?.message || "Failed to get current location");
            }
        } finally {
            setIsLocating(false);
        }
    };

    const handleAddressChange = (address: string, latitude: number, longitude: number) => {
        setNewAddress({
            location: address,
            latitude,
            longitude,
        });
    };

    const handleDeleteAddress = async (addressId: string) => {
        const ok = await confirmAction({
            title: "Delete address?",
            description: "This address will be removed from your account.",
            confirmText: "Delete",
            cancelText: "Cancel",
            variant: "danger",
        });
        if (!ok) {
            return;
        }

        try {
            await authApi.deleteAddress(addressId);
            toast.success("Address deleted successfully!");
            fetchAddresses();
        } catch (error) {
            let errorMessage = "Failed to delete address";
            if (error && typeof error === "object" && "response" in error) {
                const axiosError = error as {
                    response?: { data?: { message?: string } };
                    message?: string;
                };
                errorMessage = axiosError.response?.data?.message || axiosError.message || errorMessage;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            }
            toast.error(errorMessage);
        }
    };

    return (
        <AccountAddressesPageView
            userId={user?.id ?? null}
            addresses={addresses}
            loading={loading}
            authLoading={authLoading}
            mounted={mounted}
            isAdding={isAdding}
            submitting={submitting}
            isLocating={isLocating}
            newAddress={newAddress}
            onToggleAdd={() => setIsAdding(!isAdding)}
            onSubmit={handleAddAddress}
            onUseCurrentLocation={handleUseCurrentLocation}
            onAddressChange={handleAddressChange}
            onCancelAdd={() => {
                setIsAdding(false);
                setNewAddress({
                    location: "",
                    longitude: 0,
                    latitude: 0,
                });
            }}
            onDeleteAddress={handleDeleteAddress}
        />
    );
}

