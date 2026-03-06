import { authApi } from "@/lib/api/authApi";
import type { AddressRequest } from "@/types";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

async function reverseGeocode(params: { latitude: number; longitude: number }) {
    const { latitude, longitude } = params;
    const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=en`,
        { headers: { "User-Agent": "FoodEats/1.0" } },
    );
    return response.json();
}

export function useAccountAddressForm(params: { userId: string | null; onAdded: () => void }) {
    const { userId, onAdded } = params;
    const [isAdding, setIsAdding] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [newAddress, setNewAddress] = useState<AddressRequest>({
        location: "",
        longitude: 0,
        latitude: 0,
    });

    const hasCoordinates = useMemo(
        () => Boolean(newAddress.latitude && newAddress.longitude && newAddress.latitude !== 0 && newAddress.longitude !== 0),
        [newAddress.latitude, newAddress.longitude],
    );

    const toggleAdding = useCallback(() => setIsAdding((v) => !v), []);

    const cancelAdding = useCallback(() => {
        setIsAdding(false);
        setNewAddress({ location: "", longitude: 0, latitude: 0 });
    }, []);

    const handleAddressChange = useCallback((address: string, latitude: number, longitude: number) => {
        setNewAddress({ location: address, latitude, longitude });
    }, []);

    const submitAdd = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            if (!userId) {
                toast.error("User information not available");
                return;
            }

            if (!newAddress.location.trim()) {
                toast.error("Please enter an address");
                return;
            }

            if (!hasCoordinates) {
                toast.error("Please select an address from the suggestions to automatically get coordinates");
                return;
            }

            setSubmitting(true);
            try {
                await authApi.addAddress(userId, { ...newAddress });
                toast.success("Address added successfully!");
                setNewAddress({ location: "", longitude: 0, latitude: 0 });
                setIsAdding(false);
                onAdded();
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
        },
        [hasCoordinates, newAddress, onAdded, userId],
    );

    const useCurrentLocation = useCallback(async () => {
        if (submitting || isLocating) return;

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
                    { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
                );
            });

            try {
                const data = await reverseGeocode({ latitude: coords.latitude, longitude: coords.longitude });

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
    }, [isLocating, submitting]);

    return {
        isAdding,
        submitting,
        isLocating,
        newAddress,
        hasCoordinates,
        toggleAdding,
        cancelAdding,
        handleAddressChange,
        submitAdd,
        useCurrentLocation,
        setNewAddress,
    };
}

