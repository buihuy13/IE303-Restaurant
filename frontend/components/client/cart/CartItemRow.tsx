import { getImageUrl } from "@/lib/utils";
import { CartItem, useCartStore } from "@/stores/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";

// Format price to VND
const formatPriceVND = (amount: number): string => {
    return `${Math.round(amount).toLocaleString("vi-VN")} ₫`;
};

interface CartItemRowProps {
    item: CartItem;
    isSelected: boolean;
    onToggleSelect: () => void;
}

export const CartItemRow = ({ item, isSelected, onToggleSelect }: CartItemRowProps) => {
    const { updateQuantity, removeItem } = useCartStore();

    const imageUrl = getImageUrl(item.image);
    const finalImageUrl = imageUrl || "/placeholder.png";
    const hasImage = finalImageUrl && finalImageUrl !== "/placeholder.png";
    const itemTotal = item.price * item.quantity;

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:gap-4">
            {/* Checkbox */}
            <div className="flex-shrink-0 pt-1">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onToggleSelect}
                    aria-label={isSelected ? "Deselect item" : "Select item"}
                    className="w-5 h-5 text-brand-orange border-gray-300 rounded focus:ring-brand-orange focus:ring-2 cursor-pointer"
                />
            </div>

            {/* Product Image - Square */}
            {hasImage ? (
                <div className="relative h-20 w-20 md:h-24 md:w-24 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 ring-1 ring-gray-200">
                    <Image
                        src={finalImageUrl}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 80px, 96px"
                        unoptimized={finalImageUrl.startsWith("http")}
                    />
                </div>
            ) : (
                <div className="flex h-20 w-20 md:h-24 md:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-orange-200 text-brand-orange flex-shrink-0 ring-1 ring-orange-200">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                    </svg>
                </div>
            )}

            {/* Product Info */}
            <div className="flex-grow min-w-0">
                {/* Product Name - Bold */}
                <p className="font-bold text-base md:text-lg leading-tight text-gray-900 mb-1">{item.name}</p>

                {/* Size and Customizations - Small gray text */}
                <div className="space-y-0.5 mb-2">
                    {item.sizeName && (
                        <p className="text-xs text-gray-500">Size: {item.sizeName}</p>
                    )}
                    {item.customizations && (
                        <p className="text-xs text-gray-500 truncate max-w-[200px]" title={item.customizations}>
                            {item.customizations}
                        </p>
                    )}
                </div>

                {/* Price per item */}
                <p className="text-sm text-gray-500 mb-2">{formatPriceVND(item.price)}</p>

                {/* Quantity Control */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white shadow-sm">
                        <button
                            title="Decrease item"
                            aria-label={`Decrease quantity for ${item.name}`}
                            onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity - 1)}
                            className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={item.quantity <= 1}
                        >
                            <Minus className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="px-4 py-1.5 font-semibold text-gray-900 min-w-[2.5rem] text-center bg-white border-x border-gray-200">
                            {item.quantity}
                        </span>
                        <button
                            title="Increase item"
                            aria-label={`Increase quantity for ${item.name}`}
                            onClick={() => updateQuantity(item.id, item.restaurantId, item.quantity + 1)}
                            className="p-2 hover:bg-brand-orange/10 hover:text-brand-orange transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Delete Button */}
                    <button
                        title="Remove item"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeItem(item.id, item.restaurantId)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            </div>

            {/* Total Item Price - Orange, Bold */}
            <div className="flex-shrink-0 pl-9 text-left sm:pl-0 sm:text-right">
                <p className="font-bold text-base text-brand-orange sm:text-lg">{formatPriceVND(itemTotal)}</p>
            </div>
        </div>
    );
};
