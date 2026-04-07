"use client";

import AddressAutocomplete from "@/components/AddressAutocomplete";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authApi } from "@/lib/api/authApi";
import { orderApi, type CreateOrderRequest } from "@/lib/api/orderApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { clearCheckoutSelection, loadCheckoutSelection, type CheckoutSelection } from "@/lib/checkoutSelection";
import { useGeolocation } from "@/lib/userLocation";
import { getImageUrl } from "@/lib/utils";
import { useCartStore, type CartItem } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import type { Address } from "@/types";
import { OrderStatus } from "@/types/order.type";
import { ArrowLeft, Edit2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

const SHIPPING_FEE = 0; // Free shipping

// Format price to USD
const formatPriceUSD = (priceUSD: number): string => {
    return priceUSD.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

export default function PaymentPageClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const restaurantId = searchParams.get("restaurantId");

    const { items, clearRestaurant, removeItem, setUserId, userId: cartUserId, isLoading: cartLoading, fetchCart } =
        useCartStore();
    const { user, loading: authLoading, isAuthenticated } = useAuthStore();
    const { coords, error: locationError } = useGeolocation();
    const [cartFetched, setCartFetched] = useState(false);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [checkoutSelection, setCheckoutSelection] = useState<CheckoutSelection | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [useNewAddress, setUseNewAddress] = useState(false);
    const [newAddressLat, setNewAddressLat] = useState<number | null>(null);
    const [newAddressLon, setNewAddressLon] = useState<number | null>(null);

    // PayOS redirect after order is created
    const [isProcessingCardPayment, setIsProcessingCardPayment] = useState(false);
    const payosReturnHandledRef = useRef(false);
    const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.username || "",
        phone: (user as { phone?: string })?.phone || "",
        street: "",
        note: "",
    });

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

    const completeAfterPayOS = useCallback(
        async (orderIds: string[]) => {
            setIsPaymentSuccess(true);
            setIsProcessingCardPayment(false);

            toast.success("Payment successful! Your order has been placed.", {
                duration: 3000,
            });

            if (orderIds.length > 0) {
                try {
                    await new Promise((resolve) => setTimeout(resolve, 1000));
                    await orderApi.updateOrderStatus(orderIds[0], OrderStatus.COMPLETED);
                } catch (error) {
                    console.error("Failed to update order status to completed:", error);
                }
            }

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
                return;
            }
            void completeAfterPayOS(orderIds);
        }
    }, [searchParams, router, completeAfterPayOS]);

    // Fetch user addresses
    useEffect(() => {
        if (user?.id && isAuthenticated) {
            setLoadingAddresses(true);
            authApi
                .getUserAddresses(user.id)
                .then((data) => {
                    if (Array.isArray(data) && data.length > 0) {
                        setAddresses(data);
                        const preferredLocation = (user as unknown as { defaultAddress?: string | null })
                            ?.defaultAddress;
                        const preferred =
                            (preferredLocation ? data.find((a) => a.location === preferredLocation) : undefined) ||
                            data[0];

                        setSelectedAddressId(preferred.id);
                        // Auto-fill form with preferred address
                        const firstAddress = preferred;
                        setFormData((prev) => ({
                            ...prev,
                            street: firstAddress.location || "",
                        }));
                    } else {
                        setUseNewAddress(true);
                    }
                })
                .catch((error) => {
                    console.warn("Failed to fetch addresses:", error);
                    setUseNewAddress(true);
                })
                .finally(() => {
                    setLoadingAddresses(false);
                });
        }
    }, [user, isAuthenticated]);

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
            router.push("/login");
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
            setCartFetched(false);
            return;
        }

        if (user?.id && cartUserId === user.id && !cartFetched && !cartLoading) {
            fetchCart()
                .then(() => {
                    setCartFetched(true);
                })
                .catch((error) => {
                    const status = (error as { response?: { status?: number } })?.response?.status;
                    if (status !== 404 && status !== 503) {
                        console.warn("Failed to fetch cart:", error);
                    }
                    setCartFetched(true);
                });
        }

        if (user?.id && cartUserId === user.id && !cartLoading && !cartFetched) {
            setCartFetched(true);
        }
    }, [
        authLoading,
        user,
        isAuthenticated,
        restaurantId,
        items,
        cartUserId,
        cartFetched,
        cartLoading,
        fetchCart,
        setUserId,
        router,
    ]);

    // Check if cart is empty (but skip if payment just succeeded to avoid redirect conflict)
    useEffect(() => {
        if (!user || cartLoading || !cartFetched || isPaymentSuccess) return;

        const delay = 300;
        const checkTimer = setTimeout(() => {
            const itemsToCheck = restaurantId ? orderItems : items;
            if (itemsToCheck.length === 0 && cartUserId) {
                toast.error("Your cart is empty");
                router.push("/cart");
            }
        }, delay);

        return () => clearTimeout(checkTimer);
    }, [user, orderItems, items, cartUserId, cartFetched, cartLoading, router, restaurantId, isPaymentSuccess]);

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
    const handleAddressAutocompleteChange = (address: string, latitude: number, longitude: number) => {
        setFormData((prev) => ({
            ...prev,
            street: address,
        }));
        setNewAddressLat(latitude);
        setNewAddressLon(longitude);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!user?.id) {
            toast.error("Please login to place order");
            router.push("/login");
            return;
        }

        if (!restaurantId) {
            toast.error("Please select a restaurant to checkout");
            router.push("/cart");
            return;
        }

        if (orderItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        // Validate form
        if (!formData.name || !formData.phone) {
            toast.error("Please fill in your name and phone number");
            return;
        }

        if (!formData.street) {
            toast.error("Please enter delivery address");
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
            toast.error(
                "Unable to determine delivery coordinates. Please select an address from the suggestions or enable location services and try again.",
            );
            return;
        }

        setIsSubmitting(true);

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
                    street: formData.street,
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
        } finally {
            setIsSubmitting(false);
        }
    };

    /** Creates PayOS link (`POST /api/payments/create`) and redirects the browser. */
    const handlePayOSRedirect = async (order: { orderId: string }) => {
        if (!user?.id) {
            toast.error("Please login to complete payment");
            setIsProcessingCardPayment(false);
            return;
        }

        const loadingToast = toast.loading("Preparing payment...");

        try {
            const calculatedTotal = subtotal + shipping + tax;
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const rid = restaurantId || "";
            const returnUrl = `${origin}/payment?payos_return=success&orderId=${encodeURIComponent(order.orderId)}&restaurantId=${encodeURIComponent(rid)}`;
            const cancelUrl = `${origin}/payment?payos_return=cancel&restaurantId=${encodeURIComponent(rid)}`;

            sessionStorage.setItem(
                "payos_pending_checkout",
                JSON.stringify({ orderIds: [order.orderId], restaurantId: rid || null }),
            );

            const res = await paymentApi.createPayment({
                orderId: order.orderId,
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
        }
    };

    if (authLoading || cartLoading || !cartFetched || loadingAddresses) {
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
                                    rows={3}
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
                                                {item.quantity} x {formatPriceUSD(item.price)} $
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {formatPriceUSD(item.price * item.quantity)} $
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Bill Calculation */}
                        <div className="space-y-2 mb-6 pt-4 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900 font-medium">{formatPriceUSD(subtotal)} $</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping Fee</span>
                                <span className="text-gray-900 font-medium">
                                    {shipping === 0 ? "FREE" : `${formatPriceUSD(shipping)} $`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span className="text-gray-900 font-medium">{formatPriceUSD(tax)} $</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-lg font-semibold text-gray-900">Total</span>
                            <span className="text-2xl font-bold text-brand-orange">{formatPriceUSD(total)} $</span>
                        </div>
                    </div>

                    {/* Block B: Payment Method */}
                    <div className="rounded-3xl border border-gray-200/90 bg-white p-6 shadow-[0_12px_35px_rgba(15,23,42,0.07)]" data-payment-form>
                        <h2 className="text-xl font-bold tracking-tight mb-4 text-gray-900">Payment Method</h2>
                        {isProcessingCardPayment ? (
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-brand-orange/25 bg-brand-orange/5 p-5 text-sm text-gray-700">
                                    <p className="font-semibold text-gray-900 mb-1">PayOS checkout</p>
                                    <p className="text-gray-600">
                                        Opening secure payment page. If nothing happens, allow pop-ups or try again.
                                    </p>
                                </div>
                                <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm py-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-orange"></div>
                                    <span>Redirecting...</span>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="text-gray-500 text-sm py-4 text-center">
                                    Please click &quot;Place Order&quot; — you will be sent to PayOS to pay.
                                </div>

                                {/* Place Order Button - Only show if not processing card payment */}
                                {!isProcessingCardPayment && (
                                <Button
                                        type="submit"
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        variant="brand"
                                    className="mt-4 h-12 w-full rounded-full shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Placing order..." : "Place Order"}
                                    </Button>
                                )}
                            </div>
                        )}
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
                                            {item.quantity} x {formatPriceUSD(item.price)} $
                                        </p>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900">
                                        {formatPriceUSD(item.price * item.quantity)} $
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bill Calculation */}
                    <div className="space-y-1.5 mb-4 pt-3 border-t border-gray-200">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900 font-medium">{formatPriceUSD(subtotal)} $</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Shipping</span>
                            <span className="text-gray-900 font-medium">
                                {shipping === 0 ? "FREE" : `${formatPriceUSD(shipping)} $`}
                            </span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Tax</span>
                            <span className="text-gray-900 font-medium">{formatPriceUSD(tax)} $</span>
                        </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                        <span className="text-base font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-brand-orange">{formatPriceUSD(total)} $</span>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="rounded-3xl border border-gray-200/90 bg-white p-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)]" data-payment-form>
                    <h2 className="text-lg font-bold tracking-tight mb-4 text-gray-900">Payment Method</h2>
                    {isProcessingCardPayment ? (
                        <div className="space-y-4">
                            <div className="rounded-2xl border border-brand-orange/25 bg-brand-orange/5 p-4 text-sm text-gray-700">
                                <p className="font-semibold text-gray-900 mb-1">PayOS checkout</p>
                                <p className="text-gray-600 text-xs">Redirecting to secure payment…</p>
                            </div>
                            <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm py-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-orange"></div>
                                <span>Redirecting...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-gray-500 text-sm py-4 text-center">
                                Click &quot;Place Order&quot; to open PayOS payment.
                            </div>

                            {/* Place Order Button - Only show if not processing card payment */}
                            {!isProcessingCardPayment && (
                                <Button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    variant="brand"
                                    className="w-full h-12 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Placing order..." : "Place Order"}
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
