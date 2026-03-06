import { useEffect } from "react";
import { initializeDefaultLocation, useLocationStore } from "@/stores/useLocationStore";

export function useSearchLocation() {
    const { currentAddress, isLocationSet } = useLocationStore();

    useEffect(() => {
        if (!isLocationSet || !currentAddress) {
            initializeDefaultLocation();
        }
    }, [isLocationSet, currentAddress]);

    return { currentAddress, isLocationSet };
}
