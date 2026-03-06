import { Ban, CheckCircle, Clock, Edit, MapPin, Trash } from "lucide-react";
import Image from "next/image";
import type { Restaurant, User } from "@/types";

interface AdminRestaurantCardProps {
    restaurant: Restaurant;
    owner?: User;
    onEdit: () => void;
    onToggleStatus: () => void;
    onDelete: () => void;
}

export function AdminRestaurantCard({ restaurant, owner, onEdit, onToggleStatus, onDelete }: AdminRestaurantCardProps) {
    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {restaurant.imageURL ? (
                    <Image
                        src={typeof restaurant.imageURL === "string" ? restaurant.imageURL : restaurant.imageURL}
                        alt={restaurant.resName}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                )}
                <div className="absolute top-2 right-2">
                    <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            restaurant.enabled
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        }`}
                    >
                        {restaurant.enabled ? "Active" : "Inactive"}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{restaurant.resName}</h3>
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Owner: {owner?.username || "—"}
                        {owner?.email ? ` (${owner.email})` : ""}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <MapPin size={14} />
                        <span className="line-clamp-1">{restaurant.address}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>
                            {restaurant.openingTime} - {restaurant.closingTime}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span>{restaurant.rating.toFixed(1)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onEdit}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Edit size={16} />
                        Edit
                    </button>
                    <button
                        onClick={onToggleStatus}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                            restaurant.enabled
                                ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                : "text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        }`}
                    >
                        {restaurant.enabled ? <Ban size={16} /> : <CheckCircle size={16} />}
                        {restaurant.enabled ? "Deactivate" : "Activate"}
                    </button>
                    <button
                        onClick={onDelete}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash size={16} />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}

