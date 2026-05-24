"use client";

import AddressAutocomplete from "@/components/AddressAutocomplete";
import { Button } from "@/components/ui/Button";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Input } from "@/components/ui/Input";
import { useAddressStore } from "@/stores/addressStore";
import { useLocationStore } from "@/stores/useLocationStore";
import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { clearCheckoutSelection, loadCheckoutSelection, type CheckoutSelection } from "@/lib/checkoutSelection";
import { useGeolocation } from "@/lib/userLocation";
import { getImageUrl } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { ArrowLeft, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const SHIPPING_FEE = 0; // Free shipping

const formatPriceVND = (price: number): string => {
    return `${Math.round(price).toLocaleString("vi-VN")} đ`;
};

export default function PaymentPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get("restaurantId");

    const { items, clearRestaurant, removeItem, setUserId, userId: cartUserId, isLoading: cartLoading } = useCartStore();
    const { user, loading: authLoading, isAuthenticated, loginWithKeycloak } = useAuthStore();
    const { coords, error: locationError } = useGeolocation();
    const addresses = useAddressStore((state) => state.addresses);
    const loadingAddresses = useAddressStore((state) => state.loading);
    const currentAddress = useLocationStore((state) => state.currentAddress);
    const setCurrentAddress = useLocationStore((state) => state.setCurrentAddress);
    const [checkoutSelection, setCheckoutSelection] = useState<CheckoutSelection | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [newAddressLat, setNewAddressLat] = useState<number | null>(null);
    const [newAddressLon, setNewAddressLon] = useState<number | null>(null);

    // PayOS redirect after order is created
    const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
    const [checkoutStage, setCheckoutStage] = useState<"idle" | "creating" | "confirming" | "payos" | "redirecting">("idle");
    const payosReturnHandledRef = useRef(false);
    const submittingLockRef = useRef(false);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.username || "",
        phone: (user as { phone?: string })?.phone || "",
        street: "",
        note: "",
    });

    const scrollToFirstVisibleField = useCallback((selectors: string[]) => {
        if (typeof window === "undefined") return;

        for (const selector of selectors) {
            const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
            const target = elements.find((el) => {
                const style = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                return style.display !== "none" && style.visibility !== "hidden" && rect.height > 0 && rect.width > 0;
            });

            if (target) {
                target.scrollIntoView({ behavior: "smooth", block: "center" });
                window.setTimeout(() => {
                    if (typeof target.focus === "function") {
                        target.focus();
                    }
                }, 120);
                return;
            }
        }
    }, []);

    useEffect(() => {
        setCheckoutSelection(loadCheckoutSelection());
    }, []);

    // Filter items by restaurant + checkout selection (if present)
    const orderItems = useMemo(() => {
        const byRestaurant = restaurantId ? items.filter((item) => item.restaurantId === restaurantId) : items;
        if (
            restaurantId &&
            checkoutSelection &&
            checkoutSelection.restaurantId === restaurantId &&
            checkoutSelection.itemIds.length > 0
        ) {
            const idSet = new Set(checkoutSelection.itemIds);
            return byRestaurant.filter((it) => idSet.has(it.id));
        }
        return byRestaurant;
    }, [restaurantId, items, checkoutSelection]);
    const subtotal = useMemo(
        () => orderItems.reduce((total, item) => total + item.price * item.quantity, 0),
        [orderItems],
    );
    const shipping = SHIPPING_FEE; // Always delivery, no pickup
    const tax = subtotal * 0.05;
    const total = subtotal + shipping + tax;
    const isSubmitDisabled = isSubmitting || isProcessingCardPayment;
    const submitLabel = isSubmitting ? "Đang xử lý..." : "Đặt hàng & thanh toán";
    const checkoutSteps = [
        { key: "cart", label: "Giỏ hàng" },
        { key: "payment", label: "Thanh toán" },
        { key: "confirm", label: "Xác nhận" },
    ] as const;

    const currentStageLabel = useMemo(() => {
        switch (checkoutStage) {
            case "creating":
                return "Đang tạo đơn hàng";
            case "confirming":
                return "Đang xác nhận dữ liệu";
            case "payos":
                return "Đang tạo phiên PayOS";
            case "redirecting":
                return "Đang chuyển hướng sang PayOS";
            default:
                return "Đang xử lý";
        }
    }, [checkoutStage]);

    const stageProgress = useMemo(() => {
        switch (checkoutStage) {
            case "creating":
                return 25;
            case "confirming":
                return 45;
            case "payos":
                return 70;
            case "redirecting":
                return 95;
            default:
                return 10;
        }
    }, [checkoutStage]);

    const completeAfterPayOS = useCallback(
        async (orderIds: string[]) => {
            setIsPaymentSuccess(true);
            setIsProcessingCardPayment(false);

            toast.success("Payment successful! Your order has been placed.", {
                duration: 3000,
            });

            if (orderIds.length > 0) {
                try {
                    const order = await orderApi.getOrderById(orderIds[0]);
                    const redirectSlug = order.slug || orderIds[0];
                    router.replace(`/delivery/${redirectSlug}?t=${Date.now()}`);
                } catch (error) {
                    console.error("Failed to fetch order slug, using orderId:", error);
                    router.replace(`/delivery/${orderIds[0]}?t=${Date.now()}`);
                }
            }

            setTimeout(() => {
                if (restaurantId) {
                    const selection = loadCheckoutSelection();
                    clearCheckoutSelection();
                    setCheckoutSelection(null);

                    if (selection && selection.restaurantId === restaurantId && selection.itemIds.length > 0) {
                        (async () => {
                            for (const itemId of selection.itemIds) {
                                try {
                                    await removeItem(itemId, restaurantId, { silent: true });
                                } catch {
                                    // ignore
                                }
                            }
                        })();
                    } else {
                        clearRestaurant(restaurantId, { silent: true });
                    }
                }
            }, 100);
        },
        [router, restaurantId, removeItem, clearRestaurant],
    );

    useEffect(() => {
        if (payosReturnHandledRef.current) return;
        const ret = searchParams.get("payos_return");
        if (!ret) return;

        if (ret === "cancel") {
            payosReturnHandledRef.current = true;
            toast.error("Payment cancelled");
            setIsProcessingCardPayment(false);
                setCheckoutStage("idle");
            const rid = searchParams.get("restaurantId");
            router.replace(rid ? `/payment?restaurantId=${encodeURIComponent(rid)}` : "/payment");
            return;
        }

        if (ret === "success") {
            payosReturnHandledRef.current = true;
            const oid = searchParams.get("orderId");
            let orderIds: string[] = [];
            if (oid) {
                orderIds = [oid];
            } else {
                const raw = sessionStorage.getItem("payos_pending_checkout");
                if (raw) {
                    try {
                        const p = JSON.parse(raw) as { orderIds?: string[] };
                        orderIds = p.orderIds ?? [];
                    } catch {
                        /* ignore */
                    }
                }
            }
            sessionStorage.removeItem("payos_pending_checkout");
            if (orderIds.length === 0) {
                toast.error("Could not restore order after payment.");
                setCheckoutStage("idle");
                return;
            }
            void completeAfterPayOS(orderIds);
        }
    }, [searchParams, router, completeAfterPayOS]);

    // Addresses hydrated by useAddressSync in ClientLayout
    useEffect(() => {
        if (!currentAddress) return;

        const matchedSavedAddress = addresses.find(
            (addr) =>
                addr.id === currentAddress.id ||
                (addr.location === currentAddress.address &&
                    Math.abs(addr.latitude - currentAddress.lat) < 0.0001 &&
                    Math.abs(addr.longitude - currentAddress.lng) < 0.0001),
        );

        if (matchedSavedAddress) {
            setSelectedAddressId(matchedSavedAddress.id);
            setUseNewAddress(false);
            setNewAddressLat(null);
            setNewAddressLon(null);
            setFormData((prev) => ({
                ...prev,
                street: matchedSavedAddress.location || prev.street,
            }));
            return;
        }

        // Header selected a location that is not saved yet -> keep as one-time checkout address
        if (currentAddress.address?.trim()) {
            setUseNewAddress(true);
            setSelectedAddressId(null);
            setNewAddressLat(currentAddress.lat);
            setNewAddressLon(currentAddress.lng);
            setFormData((prev) => ({
                ...prev,
                street: currentAddress.address,
            }));
        }
    }, [currentAddress, addresses]);

    useEffect(() => {
        if (currentAddress) return;
        if (user?.id && isAuthenticated && addresses.length > 0) {
            const preferredLocation = (user as unknown as { defaultAddress?: string | null })?.defaultAddress;
            const preferred =
                (preferredLocation ? addresses.find((a) => a.location === preferredLocation) : undefined) ||
                addresses[0];

            if (preferred && !selectedAddressId) {
                setSelectedAddressId(preferred.id);
                setFormData((prev) => ({
                    ...prev,
                    street: preferred.location || "",
                }));
            }
        } else if (user?.id && isAuthenticated && !loadingAddresses && addresses.length === 0) {
            setUseNewAddress(true);
        }
    }, [currentAddress, user, isAuthenticated, addresses, loadingAddresses, selectedAddressId]);

    // Auto-fill form from user profile
    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: user.username || prev.name,
                phone: (user as { phone?: string })?.phone || prev.phone,
            }));
        }
    }, [user]);

    // Ensure cart is initialized and fetched
    useEffect(() => {
        if (authLoading) {
            return;
        }

        const hasToken =
            typeof window !== "undefined" &&
            (localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));

        if (!user && !isAuthenticated && !hasToken) {
            toast.error("Please login to checkout");
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/payment",
            });
            return;
        }

        if (!user && hasToken && isAuthenticated) {
            return;
        }

        if (!restaurantId && items.length > 0) {
            const uniqueRestaurantIds = new Set(items.map((item) => item.restaurantId));
            if (uniqueRestaurantIds.size === 1) {
                const firstRestaurantId = Array.from(uniqueRestaurantIds)[0];
                router.replace(`/payment?restaurantId=${firstRestaurantId}`);
                return;
            }
            if (uniqueRestaurantIds.size > 1) {
                toast.error("Please checkout items from only one restaurant at a time");
                router.push("/cart");
                return;
            }
        }

        if (user?.id && cartUserId !== user.id) {
            setUserId(user.id);
        }
    }, [
        authLoading,
        user,
        isAuthenticated,
        restaurantId,
        items,
        cartUserId,
        cartLoading,
        setUserId,
        router,
        loginWithKeycloak,
    ]);

    // Check if cart is empty (but skip if payment just succeeded to avoid redirect conflict)
    useEffect(() => {
        if (!user || cartLoading || isPaymentSuccess) return;

        const delay = 300;
        const checkTimer = setTimeout(() => {
            const itemsToCheck = restaurantId ? orderItems : items;
            if (itemsToCheck.length === 0 && cartUserId) {
                toast.error("Your cart is empty");
                router.push("/cart");
            }
        }, delay);

        return () => clearTimeout(checkTimer);
    }, [user, orderItems, items, cartUserId, cartLoading, router, restaurantId, isPaymentSuccess]);

    useEffect(() => {
        if (locationError) {
            toast.error(locationError);
        }
    }, [locationError]);

    // If a checkout selection exists but doesn't match current restaurantId, clear it
    useEffect(() => {
        if (!restaurantId) return;
        if (checkoutSelection && checkoutSelection.restaurantId !== restaurantId) {
            clearCheckoutSelection();
            setCheckoutSelection(null);
        }
    }, [restaurantId, checkoutSelection]);

    // Handle address selection
    const handleAddressSelect = (addressId: string) => {
        setSelectedAddressId(addressId);
        setUseNewAddress(false);
        setNewAddressLat(null);
        setNewAddressLon(null);
        const selectedAddress = addresses.find((addr) => addr.id === addressId);
        if (selectedAddress) {
            setCurrentAddress({
                id: selectedAddress.id,
                address: selectedAddress.location,
                lat: selectedAddress.latitude,
                lng: selectedAddress.longitude,
            });
            setFormData((prev) => ({
                ...prev,
                street: selectedAddress.location || "",
            }));
        }
    };

    const handleUseNewAddress = () => {
        setUseNewAddress(true);
        setSelectedAddressId(null);
        setNewAddressLat(null);
        setNewAddressLon(null);
    };

    // Handle address autocomplete selection
    const handleAddressAutocompleteChange = (address: string, latitude?: number, longitude?: number) => {
        setFormData((prev) => ({
            ...prev,
            street: address,
        }));
        if (
            typeof latitude === "number" &&
            typeof longitude === "number" &&
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
        ) {
            setNewAddressLat(latitude);
            setNewAddressLon(longitude);
            setCurrentAddress({
                id: `checkout-${Date.now()}`,
                address,
                lat: latitude,
                lng: longitude,
            });
        } else {
            // Typed manually without picking a suggestion — rely on saved-address coords or device geolocation.
            setNewAddressLat(null);
            setNewAddressLon(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting || submittingLockRef.current) {
            return;
        }
        submittingLockRef.current = true;

        if (!user?.id) {
            toast.error("Please login to place order");
            void loginWithKeycloak({
                redirectPath: typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/payment",
            });
            submittingLockRef.current = false;
            return;
        }

        if (!restaurantId) {
            toast.error("Please select a restaurant to checkout");
            router.push("/cart");
            submittingLockRef.current = false;
            return;
        }

        if (orderItems.length === 0) {
            toast.error("Your cart is empty");
            submittingLockRef.current = false;
            return;
        }

        // Validate form
        if (!formData.name || !formData.phone) {
            if (!formData.name) {
                scrollToFirstVisibleField(["#desktop-name", "#mobile-name"]);
            } else {
                scrollToFirstVisibleField(["#desktop-phone", "#mobile-phone"]);
            }
            toast.error("Please fill in your name and phone number");
                submittingLockRef.current = false;
            return;
        }

        if (!formData.street.trim()) {
            scrollToFirstVisibleField([
                "#desktop-address-autocomplete",
                "#mobile-address-autocomplete",
                'input[placeholder^="Enter address"]',
            ]);
            toast.error("Please enter delivery address");
            submittingLockRef.current = false;
            return;
        }

        const selectedSavedAddress =
            !useNewAddress && selectedAddressId ? addresses.find((addr) => addr.id === selectedAddressId) : undefined;

        // Use new address lat/lon if available, otherwise use saved address, otherwise use geolocation
        const resolvedLatitude = useNewAddress && newAddressLat !== null
            ? newAddressLat
            : selectedSavedAddress?.latitude ?? coords?.latitude;
        const resolvedLongitude = useNewAddress && newAddressLon !== null
            ? newAddressLon
            : selectedSavedAddress?.longitude ?? coords?.longitude;

        if (typeof resolvedLatitude !== "number" || typeof resolvedLongitude !== "number") {
            scrollToFirstVisibleField([
                "#desktop-address-autocomplete",
                "#mobile-address-autocomplete",
                'input[placeholder^="Enter address"]',
            ]);
            toast.error(
                "Unable to determine delivery coordinates. Please select an address from the suggestions or enable location services and try again.",
            );
            submittingLockRef.current = false;
            return;
        }

        setIsSubmitting(true);
        setCheckoutStage("creating");

        try {
            // Filter out items with invalid restaurantId
            const validOrderItems = orderItems.filter(
                (item) => item.restaurantId && item.restaurantId.trim() !== "" && item.restaurantId !== "null" && item.restaurantId !== "undefined"
            );

            if (validOrderItems.length === 0) {
                throw new Error("No valid items with restaurant information found");
            }

            // Group items by restaurant (should only be one)
            const restaurantGroups = validOrderItems.reduce(
                (acc, item) => {
                    if (!acc[item.restaurantId]) {
                        acc[item.restaurantId] = {
                            restaurantName: item.restaurantName,
                            items: [] as CartItem[],
                        };
                    }
                    acc[item.restaurantId].items.push(item);
                    return acc;
                },
                {} as Record<string, { restaurantName?: string; items: CartItem[] }>,
            );

            const restaurantEntries = Object.entries(restaurantGroups);

            if (restaurantEntries.length !== 1) {
                throw new Error("Each order can only be for one restaurant");
            }

            const [restId, group] = restaurantEntries[0];

            // Validate restId - use restaurantId from URL as fallback if restId is invalid
            const finalRestaurantId = (restId && restId !== "null" && restId !== "undefined" && restId.trim() !== "")
                ? restId
                : restaurantId;

            if (!finalRestaurantId || finalRestaurantId.trim() === "") {
                throw new Error("Restaurant ID is missing. Please try again or refresh the page.");
            }

            // Get final delivery coordinates (saved address if selected, otherwise device geolocation)
            const finalLatitude = resolvedLatitude;
            const finalLongitude = resolvedLongitude;

            const payload: CreateOrderRequest = {
                userId: user.id,
                restaurantId: finalRestaurantId,
                restaurantName: group.restaurantName || "Unknown Restaurant",
                deliveryAddress: {
                    street: formData.street.trim(),
                    city: "Ho Chi Minh City", // Default city
                    state: "Ho Chi Minh", // Default state
                    zipCode: "700000", // Default zip code
                },
                items: group.items.map((item) => {
                    const customizationParts: string[] = [];
                    if (item.sizeName) {
                        customizationParts.push(`Size: ${item.sizeName}`);
                    }
                    if (item.customizations) {
                        customizationParts.push(item.customizations);
                    }
                    const customizations = customizationParts.join(" | ");

                    return {
                        productId: item.id,
                        productName: item.name,
                        quantity: item.quantity,
                        price: item.price,
                        customizations: customizations || undefined,
                    };
                }),
                paymentMethod: "card", // PayOS card checkout
                orderNote: formData.note.trim() ? formData.note.trim() : undefined,
                userLat: typeof finalLatitude === "number" ? finalLatitude : 0,
                userLon: typeof finalLongitude === "number" ? finalLongitude : 0,
            };

            const order = await orderApi.createOrder(payload);
            // Wait for PayOS redirect — don't clear cart until payment success callback
            setCheckoutStage("payos");
            setIsProcessingCardPayment(true);
            await handlePayOSRedirect(order);
        } catch (error: unknown) {
            console.error("Failed to create order:", error);
            const errorMessage =
                (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
                (error as { message?: string })?.message ||
                "Failed to create order. Please try again.";

            if (errorMessage.includes("Restaurant is currently closed")) {
                toast.error("This restaurant is currently closed. Please check the operating hours.", {
                    duration: 6000,
                });
            } else {
                toast.error(errorMessage);
            }
            setCheckoutStage("idle");
        } finally {
            setIsSubmitting(false);
            submittingLockRef.current = false;
        }
    };

    /** Creates PayOS link (`POST /api/payments/create`) and redirects the browser. */
    const handlePayOSRedirect = async (order: { orderId: string; slug?: string }) => {
        if (!user?.id) {
            toast.error("Please login to complete payment");
            setIsProcessingCardPayment(false);
            return;
        }

        const resolvedOrderId = order.orderId?.trim() || order.slug?.trim() || "";
        if (!resolvedOrderId) {
            toast.error("Could not resolve order id for payment. Please try placing the order again.");
            setIsProcessingCardPayment(false);
            return;
        }

        const loadingToast = toast.loading("Preparing payment...");

        try {
            setCheckoutStage("confirming");
            const calculatedTotal = subtotal + shipping + tax;
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const rid = restaurantId || "";
            const returnUrl = `${origin}/payment?payos_return=success&orderId=${encodeURIComponent(resolvedOrderId)}&restaurantId=${encodeURIComponent(rid)}`;
            const cancelUrl = `${origin}/payment?payos_return=cancel&restaurantId=${encodeURIComponent(rid)}`;

            sessionStorage.setItem(
                "payos_pending_checkout",
                JSON.stringify({ orderIds: [resolvedOrderId], restaurantId: rid || null }),
            );

            setCheckoutStage("payos");
            const res = await paymentApi.createPayment({
                orderId: resolvedOrderId,
                userId: user.id,
                amount: calculatedTotal,
                paymentMethod: "card",
                returnUrl,
                cancelUrl,
            });

            if (!res.checkoutUrl) {
                throw new Error("Payment service did not return a checkout URL");
            }

            toast.dismiss(loadingToast);
            setCheckoutStage("redirecting");
            window.location.assign(res.checkoutUrl);
        } catch (error: unknown) {
            let errorMessage = "Unable to create payment. Please try again.";
            if (error && typeof error === "object") {
                const errorObj = error as { response?: { data?: { message?: string } }; message?: string };
                if (errorObj.response?.data?.message) {
                    errorMessage = errorObj.response.data.message;
                } else if (errorObj.message) {
                    errorMessage = errorObj.message;
                }
            }

            toast.dismiss(loadingToast);
            toast.error(errorMessage, { duration: 5000 });
            setIsProcessingCardPayment(false);
            setCheckoutStage("idle");
        }
    };

    if (authLoading || cartLoading || loadingAddresses) {
        return <GlobalLoader label="Loading" sublabel="Setting up checkout" />;
    }

    // Don't show cart empty message if payment was successful (redirect should happen)
    if (orderItems.length === 0 && !isPaymentSuccess) {
        return (
            <div className="custom-container py-8 sm:py-10 md:py-12">
                <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">Your cart is empty</p>
                    <Button onClick={() => router.push("/cart")} variant="link" className="text-brand-orange">
                        Go to Cart
                    </Button>
                </div>
            </div>
        );
    }

    // Show loader if payment success but redirect hasn't happened yet
    if (isPaymentSuccess) {
        return <GlobalLoader label="Redirecting" sublabel="Taking you to order tracking..." />;
    }

    if (isSubmitting || isProcessingCardPayment) {
        return (
            <div className="custom-container py-8 sm:py-10 md:py-12">
                <div className="mx-auto max-w-3xl rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                    <div className="mb-6 flex items-center justify-between gap-2">
                        {checkoutSteps.map((step, idx) => {
                            const active = idx <= 1;
                            const done = idx === 0;
                            return (
                                <div key={step.key} className="flex flex-1 items-center gap-2">
                                    <div
                                        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                            done
                                                ? "bg-brand-orange text-white"
                                                : active
                                                ? "border border-brand-orange text-brand-orange"
                                                : "border border-gray-300 text-gray-400"
                                        }`}
                                    >
                                        {done ? "✓" : idx + 1}
                                    </div>
                                    <span className={`text-xs sm:text-sm ${active ? "text-gray-800" : "text-gray-400"}`}>{step.label}</span>
                                    {idx < checkoutSteps.length - 1 && <div className="h-px flex-1 bg-gray-200" />}
                                </div>
                            );
                        })}
                    </div>

                    <div className="rounded-2xl border border-brand-orange/20 bg-brand-orange/5 p-4">
                        <p className="text-sm font-semibold text-gray-900">{currentStageLabel}</p>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                            <div
                                className="h-full rounded-full bg-brand-orange transition-[width] duration-300"
                                style={{ width: `${stageProgress}%` }}
                            />
                        </div>
                        <p className="mt-2 text-xs text-gray-600">Vui lòng không tắt tab trong lúc hoàn tất thanh toán PayOS.</p>
                    </div>

                    <div className="mt-5 rounded-2xl border border-gray-200 p-4">
                        <p className="text-sm font-semibold text-gray-900 mb-3">Tóm tắt đơn hàng</p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {orderItems.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 text-sm">
                                    <p className="truncate text-gray-700">
                                        {item.name} <span className="text-gray-500">x{item.quantity}</span>
                                    </p>
                                    <p className="font-semibold text-gray-900">{formatPriceVND(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 border-t pt-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Tạm tính</span>
                                <span>{formatPriceVND(subtotal)}</span>
                            </div>
                            <div className="mt-1 flex justify-between text-gray-600">
                                <span>Thuế (5%)</span>
                                <span>{formatPriceVND(tax)}</span>
                            </div>
                            <div className="mt-2 flex justify-between text-base font-semibold text-gray-900">
                                <span>Tổng cộng</span>
                                <span className="text-brand-orange">{formatPriceVND(total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="custom-container py-8 sm:py-10 md:py-12">
            {/* Header with Back Button */}
            <div className="mb-7">
                <Link
                    href="/cart"
                    className="group mb-4 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-brand-orange"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Cart</span>
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Checkout</h1>
                <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                        {checkoutSteps.map((step, idx) => (
                            <div key={step.key} className="flex flex-1 items-center gap-2">
                                <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                                        idx === 0 ? "bg-brand-orange text-white" : idx === 1 ? "border border-brand-orange text-brand-orange" : "border border-gray-300 text-gray-400"
                                    }`}
                                >
                                    {idx === 0 ? "✓" : idx + 1}
                                </div>
                                <span className={`text-xs sm:text-sm ${idx <= 1 ? "text-gray-800" : "text-gray-400"}`}>{step.label}</span>
                                {idx < checkoutSteps.length - 1 && <div className="h-px flex-1 bg-gray-200" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop: 2 Column Layout */}
            <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                {/* Left Column: Delivery Details Only */}
                <div className="space-y-6">
                    {/* Block A: Delivery Details */}
                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <h2 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Delivery Details</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name */}
                            <div>
                                <label htmlFor="desktop-name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Name
                                </label>
                                <Input
                                    id="desktop-name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="h-10"
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <label htmlFor="desktop-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <Input
                                    id="desktop-phone"
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    className="h-10"
                                />
                            </div>

                            {/* Address Selection */}
                            <fieldset className="space-y-3">
                                <legend className="block text-sm font-medium text-gray-700">
                                    Delivery address
                                </legend>

                                {addresses.length > 0 && (
                                    <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5">
                                        <input
                                            type="radio"
                                            name="addressMode"
                                            checked={!useNewAddress}
                                            onChange={() => {
                                                setUseNewAddress(false);
                                                if (!selectedAddressId && addresses[0]?.id) {
                                                    handleAddressSelect(addresses[0].id);
                                                }
                                            }}
                                            className="mt-1 h-4 w-4 accent-brand-orange"
                                        />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-gray-900">
                                                Use a saved address
                                            </div>
                                            {!useNewAddress && (
                                                <div className="mt-2 space-y-2">
                                                    {addresses.map((addr) => {
                                                        const selected = addr.id === selectedAddressId;
                                                        return (
                                                            <button
                                                                key={addr.id}
                                                                type="button"
                                                                onClick={() => handleAddressSelect(addr.id)}
                                                                className={
                                                                    "w-full rounded-xl border p-3 text-left transition-colors " +
                                                                    (selected
                                                                        ? "border-brand-orange bg-brand-orange/5"
                                                                        : "border-gray-200 hover:bg-gray-50")
                                                                }
                                                            >
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <div className="min-w-0 flex-1">
                                                                        <div className="truncate text-sm text-gray-900">
                                                                            {addr.location}
                                                                        </div>
                                                                    </div>
                                                                    {selected && (
                                                                        <span className="text-xs font-semibold text-brand-orange">
                                                                            Selected
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    </label>
                                )}

                                <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3.5">
                                    <input
                                        type="radio"
                                        name="addressMode"
                                        checked={useNewAddress || addresses.length === 0}
                                        onChange={handleUseNewAddress}
                                        className="mt-1 h-4 w-4 accent-brand-orange"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="text-sm font-medium text-gray-900">
                                                Use a new address
                                            </div>
                                            <span className="text-xs text-gray-500">One-time</span>
                                        </div>
                                        {(useNewAddress || addresses.length === 0) && (
                                            <div className="mt-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Street Address
                                                </label>
                                                <AddressAutocomplete
                                                    id="desktop-address-autocomplete"
                                                    value={formData.street}
                                                    onChange={handleAddressAutocompleteChange}
                                                    placeholder="Enter address (e.g., 123 Main Street, Ho Chi Minh City)..."
                                                    className="w-full"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </label>
                            </fieldset>

                            {/* Note for Driver */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note for Driver (Optional)
                                </label>
                                <textarea
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Any special instructions..."
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                />
                            </div>
                        </form>
                    </div>
                </div>

                {/* Right Column: Order Summary + Payment Method */}
                <div className="h-fit space-y-6 lg:sticky lg:top-24">
                    {/* Block A: Order Summary */}
                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                        <h2 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Order Summary</h2>

                        {/* Items List */}
                        <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                            {orderItems.map((item, idx) => {
                                const imageUrl = getImageUrl(item.image);
                                return (
                                    <div key={idx} className="flex items-center gap-3">
                                        {imageUrl && imageUrl !== "/placeholder.png" ? (
                                            <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                                <Image
                                                    src={imageUrl}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                    unoptimized={imageUrl.startsWith("http")}
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-12 h-12 bg-gray-100 rounded-md flex-shrink-0"></div>
                                        )}
                                        <div className="flex-grow min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {item.quantity} x {formatPriceVND(item.price)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatPriceVND(item.price * item.quantity)}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bill Calculation */}
                        <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-medium">{formatPriceVND(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="text-gray-900 font-medium">
                                    {shipping === 0 ? "Miễn phí" : formatPriceVND(shipping)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-gray-900 font-medium">{formatPriceVND(tax)}</span>
                            </div>
                            <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
                                <p className="text-xs font-semibold text-gray-900">Phương thức thanh toán</p>
                                <p className="mt-1 text-sm text-gray-600">Thẻ nội địa / quốc tế / QR (PayOS)</p>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-brand-orange">{formatPriceVND(total)}</span>
                        </div>

                        <div className="mt-4 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                            Sau khi đặt, bạn sẽ được chuyển sang PayOS để hoàn tất thanh toán. Vui lòng không tắt tab.
                        </div>

                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            variant="brand"
                            className="mt-6 h-12 w-full rounded-full shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile: Single Column */}
            <div className="space-y-6 pb-24 lg:hidden">
                {/* Delivery Details */}
                <div className="rounded-3xl border border-gray-200/90 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                    <h2 className="text-lg font-bold tracking-tight mb-4 text-gray-900">Delivery Details</h2>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {/* Name */}
                        <div>
                            <label htmlFor="mobile-name" className="block text-sm font-medium text-gray-700 mb-1">
                                Name
                            </label>
                            <Input
                                id="mobile-name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="h-10 text-sm"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="mobile-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <Input
                                id="mobile-phone"
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                className="h-10 text-sm"
                            />
                        </div>

                        {/* Address Selection */}
                        {addresses.length > 0 && !useNewAddress ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Address
                                </label>
                                <select
                                    value={selectedAddressId || ""}
                                    onChange={(e) => handleAddressSelect(e.target.value)}
                                    aria-label="Select Address"
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                                >
                                    {addresses.map((addr) => (
                                        <option key={addr.id} value={addr.id}>
                                            {addr.location}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={() => setUseNewAddress(true)}
                                    variant="link"
                                    className="mt-2 h-auto p-0 text-xs text-brand-orange hover:text-brand-orange/80 flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Use new address
                                </Button>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Street Address
                                </label>
                                <AddressAutocomplete
                                    id="mobile-address-autocomplete"
                                    value={formData.street}
                                    onChange={handleAddressAutocompleteChange}
                                    placeholder="Enter address (e.g., 123 Main Street, Ho Chi Minh City)..."
                                    className="w-full"
                                />
                                {addresses.length > 0 && (
                                    <Button
                                        type="button"
                                        onClick={() => {
                                            setUseNewAddress(false);
                                            if (addresses.length > 0) {
                                                handleAddressSelect(addresses[0].id);
                                            }
                                        }}
                                        variant="link"
                                        className="mt-2 h-auto p-0 text-xs text-brand-orange hover:text-brand-orange/80"
                                    >
                                        Use saved address
                                    </Button>
                                )}
                            </div>
                        )}

                        {/* Note for Driver */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Note for Driver (Optional)
                            </label>
                            <textarea
                                name="note"
                                value={formData.note}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Any special instructions..."
                                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-brand-orange focus:outline-none focus:ring-2 focus:ring-brand-orange/30"
                            />
                        </div>
                    </form>
                </div>

                {/* Order Summary */}
                <div className="rounded-3xl border border-gray-200/90 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)]">
                    <h2 className="text-lg font-bold tracking-tight mb-4 text-gray-900">Order Summary</h2>

                    {/* Items List */}
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {orderItems.map((item, idx) => {
                            const imageUrl = getImageUrl(item.image);
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    {imageUrl && imageUrl !== "/placeholder.png" ? (
                                        <div className="relative w-10 h-10 rounded-md overflow-hidden flex-shrink-0">
                                            <Image
                                                src={imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                                unoptimized={imageUrl.startsWith("http")}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 bg-gray-100 rounded-md flex-shrink-0"></div>
                                    )}
                                    <div className="flex-grow min-w-0">
                                        <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">
                                            {item.quantity} x {formatPriceVND(item.price)}
                                        </p>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900">
                                        {formatPriceVND(item.price * item.quantity)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bill Calculation */}
                    <div className="space-y-1.5 mb-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900 font-medium">{formatPriceVND(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900 font-medium">
                                {shipping === 0 ? "Miễn phí" : formatPriceVND(shipping)}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-900 font-medium">{formatPriceVND(tax)}</span>
                        </div>
                        <div className="mt-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
                            <p className="text-[11px] font-semibold text-gray-900">Thanh toán qua PayOS</p>
                            <p className="mt-0.5 text-[11px] text-gray-600">Thẻ nội địa / quốc tế / QR</p>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-brand-orange">{formatPriceVND(total)}</span>
                    </div>
                    <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                        Sau khi đặt, bạn sẽ được chuyển sang PayOS để hoàn tất thanh toán. Không tắt tab.
                    </div>
                </div>
            </div>

            {!isPaymentSuccess && (
                <div className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
                    <div className="mx-auto flex w-full max-w-screen-sm items-center gap-3">
                        <div className="min-w-0">
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="truncate text-base font-bold text-brand-orange">{formatPriceVND(total)}</p>
                        </div>
                        <Button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitDisabled}
                            variant="brand"
                            className="h-11 flex-1 rounded-full disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {submitLabel}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
