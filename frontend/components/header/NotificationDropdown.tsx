"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useNotificationStore } from "@/stores/useNotificationStore";
import { Bell, CheckCircle, Clock, MessageCircle, Package, Truck, X, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// Format time ago (e.g., "2 minutes ago", "1 hour ago")
const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return "Just now";
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes > 1 ? "s" : ""} ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
};

// Get notification icon based on type
const getNotificationIcon = (type: string) => {
    switch (type) {
        case "ORDER_COMPLETED":
            return <CheckCircle className="w-5 h-5 text-green-600" />;
        case "ORDER_CONFIRMED":
            return <Truck className="w-5 h-5 text-blue-600" />;
        case "ORDER_REJECTED":
            return <XCircle className="w-5 h-5 text-red-600" />;
        case "ORDER_ACCEPTED":
            return <Package className="w-5 h-5 text-orange-600" />;
        case "MESSAGE_RECEIVED":
            return <MessageCircle className="w-5 h-5 text-blue-600" />;
        default:
            return <Bell className="w-5 h-5 text-gray-600" />;
    }
};

// Get notification image placeholder
const getNotificationImage = (type: string): string => {
    // Return placeholder image URLs based on notification type
    switch (type) {
        case "ORDER_COMPLETED":
            return "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop";
        case "ORDER_CONFIRMED":
            return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop";
        case "ORDER_REJECTED":
            return "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=100&h=100&fit=crop";
        case "ORDER_ACCEPTED":
            return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop";
        default:
            return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=100&h=100&fit=crop";
    }
};

export default function NotificationDropdown() {
    const { theme } = useClientTheme();
    const { isAuthenticated, user, loading } = useAuthStore();
    const { notifications: allNotifications, markAsRead, markAllAsRead } = useNotificationStore();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const router = useRouter();

    // Client bell: orders only — chat unread lives on the Messages icon (useChatStore).
    const visibleNotifications = allNotifications.filter(
        (n) =>
            n.type !== "MERCHANT_NEW_ORDER" &&
            n.type !== "ADMIN_MERCHANT_REQUEST" &&
            n.type !== "MESSAGE_RECEIVED",
    );
    const unread = visibleNotifications.filter((n) => !n.read).length;

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                triggerRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsHovering(false);
            }
        };

        if (isOpen || isHovering) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, isHovering]);

    // Handle notification click
    const handleNotificationClick = (notification: (typeof visibleNotifications)[number]) => {
        markAsRead(notification.id);
        setIsOpen(false);
        setIsHovering(false);

        if (notification.type === "MESSAGE_RECEIVED" && notification.roomId) {
            router.push(`/chat?roomId=${notification.roomId}`);
            return;
        }

        if (notification.orderId) {
            router.push(`/orders/${notification.orderId}`);
        } else {
            router.push("/account/orders");
        }
    };

    // Don't render if not authenticated or still loading
    if (!isAuthenticated || !user || loading) {
        return null;
    }

    return (
        <div className="relative">
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                    // Delay closing to allow moving to dropdown
                    setTimeout(() => {
                        if (!dropdownRef.current?.matches(":hover")) {
                            setIsHovering(false);
                        }
                    }, 100);
                }}
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 ${
                    theme === "dark" ? "hover:bg-white/10" : "hover:bg-gray-50"
                }`}
                aria-label="Notifications"
                title="Notifications"
            >
                <Bell className={`w-5 h-5 ${theme === "dark" ? "text-white/75" : "text-gray-600"}`} />
                {unread > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 min-w-5 bg-brand-orange text-white text-xs rounded-full px-1.5 flex items-center justify-center font-bold shadow-md">
                        {unread > 99 ? "99+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {(isOpen || isHovering) && (
                <div
                    ref={dropdownRef}
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => {
                        setIsHovering(false);
                        setIsOpen(false);
                    }}
                    className={`absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl border z-50 max-h-[500px] flex flex-col overflow-hidden ${
                        theme === "dark" ? "bg-[#12182b] border-white/12 text-white" : "bg-white border-gray-200/80"
                    }`}
                >
                    {/* Header */}
                    <div className={`flex items-center justify-between px-4 py-3 border-b ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                        <div className="flex items-center gap-2">
                            <h3 className={`text-sm font-semibold ${theme === "dark" ? "text-white/92" : "text-gray-900"}`}>Notifications</h3>
                            {unread > 0 && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === "dark" ? "text-white/70 bg-white/10" : "text-gray-500 bg-gray-100"}`}>
                                    {unread} {unread === 1 ? "new" : "new"}
                                </span>
                            )}
                        </div>
                        {unread > 0 && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    markAllAsRead();
                                }}
                                className="text-xs text-brand-orange hover:text-brand-orange/80 font-medium transition-colors"
                                title="Mark all as read"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                        {visibleNotifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className={`w-12 h-12 mx-auto mb-3 ${theme === "dark" ? "text-white/30" : "text-gray-300"}`} />
                                <p className={`text-sm ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>No notifications</p>
                            </div>
                        ) : (
                            <div className={`divide-y ${theme === "dark" ? "divide-white/10" : "divide-gray-100"}`}>
                                {visibleNotifications.slice(0, 10).map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`group relative w-full text-left p-4 transition-colors ${
                                            theme === "dark"
                                                ? !notif.read
                                                    ? "bg-brand-orange/8 hover:bg-white/8"
                                                    : "bg-transparent hover:bg-white/6"
                                                : !notif.read
                                                  ? "bg-orange-50/50 hover:bg-gray-50"
                                                  : "bg-white hover:bg-gray-50"
                                        }`}
                                    >
                                        <button
                                            onClick={() => handleNotificationClick(notif)}
                                            className="w-full text-left"
                                        >
                                            <div className="flex items-start gap-3 pr-8">
                                                {/* Image/Icon */}
                                                <div className="flex-shrink-0">
                                                    {notif.type === "ORDER_COMPLETED" ||
                                                    notif.type === "ORDER_CONFIRMED" ||
                                                    notif.type === "ORDER_ACCEPTED" ||
                                                    notif.type === "ORDER_REJECTED" ? (
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${theme === "dark" ? "bg-white/8" : "bg-gray-100"}`}>
                                                            {getNotificationIcon(notif.type)}
                                                        </div>
                                                    ) : (
                                                        <div className={`relative w-12 h-12 rounded-lg overflow-hidden ${theme === "dark" ? "bg-white/8" : "bg-gray-100"}`}>
                                                            <Image
                                                                src={getNotificationImage(notif.type)}
                                                                alt={notif.title}
                                                                width={48}
                                                                height={48}
                                                                className="object-cover"
                                                                unoptimized
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p
                                                        className={`text-sm font-medium mb-1 ${
                                                            theme === "dark" ? "text-white/92" : "text-gray-900"
                                                        } ${
                                                            !notif.read ? "font-semibold" : ""
                                                        }`}
                                                    >
                                                        {notif.title}
                                                    </p>
                                                    <p className={`text-xs line-clamp-2 mb-2 ${theme === "dark" ? "text-white/70" : "text-gray-600"}`}>{notif.message}</p>
                                                    {notif.restaurantName && (
                                                        <p className={`text-xs mb-1 ${theme === "dark" ? "text-white/60" : "text-gray-500"}`}>Restaurant: {notif.restaurantName}</p>
                                                    )}
                                                    <div className={`flex items-center gap-2 text-xs ${theme === "dark" ? "text-white/50" : "text-gray-400"}`}>
                                                        <Clock className="w-3 h-3" />
                                                        <span>{formatTimeAgo(notif.createdAt)}</span>
                                                    </div>
                                                </div>

                                                {/* Unread Indicator */}
                                                {!notif.read && (
                                                    <div className="flex-shrink-0">
                                                        <div className="w-2 h-2 bg-brand-orange rounded-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </button>

                                        {/* Mark as Read Button (appears on hover) */}
                                        {!notif.read && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    markAsRead(notif.id);
                                                }}
                                                className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors opacity-0 group-hover:opacity-100 ${
                                                    theme === "dark" ? "hover:bg-white/15" : "hover:bg-gray-200"
                                                }`}
                                                title="Mark as read"
                                            >
                                                <X className={`w-4 h-4 ${theme === "dark" ? "text-white/70" : "text-gray-500"}`} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {visibleNotifications.length > 0 && (
                        <div className={`border-t px-4 py-3 ${theme === "dark" ? "border-white/10" : "border-gray-200"}`}>
                            <Link
                                href="/account/orders"
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsHovering(false);
                                }}
                                className="block w-full text-center text-sm font-medium text-brand-orange hover:text-brand-orange/80 transition-colors"
                            >
                                View All Orders
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

