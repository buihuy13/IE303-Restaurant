"use client";

import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { Button } from "@/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getImageUrl } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import {
    BookOpen,
    LogOut,
    MessageCircle,
    Moon,
    Package,
    Sun,
    User,
    UtensilsCrossed
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import CartDropdown from "./CartDropdown";
import HeaderTooltip from "./HeaderTooltip";
import NotificationDropdown from "./NotificationDropdown";

export default function NavActions() {
    const { theme, toggleTheme } = useClientTheme();

    const {
        user,
        isAuthenticated,
        logout,
        loginWithKeycloak,
    } = useAuthStore();

    const unreadCountMap = useChatStore(
        (state) => state.unreadCountMap
    );

    const [mounted, setMounted] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const pathname = usePathname();

    const chatUnreadCount = Object.values(unreadCountMap).reduce(
        (sum, count) => sum + (count || 0),
        0
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    const showAuthenticatedUI = isAuthenticated && !!user;

    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            const loadingToast = toast.loading("Logging out...");

            await logout({
                redirectToKeycloak: true,
                postLogoutRedirectPath: "/",
            });

            toast.dismiss(loadingToast);

            toast.success("Signing out...", {
                duration: 1500,
            });
        } catch (error) {
            toast.error("Logout failed. Please try again.");
            console.error("Logout error:", error);
        } finally {
            setTimeout(() => {
                setIsLoggingOut(false);
            }, 500);
        }
    };

    const getAvatarContent = () => {
        if (user?.avatar) {
            const avatarUrl =
                typeof user.avatar === "string"
                    ? getImageUrl(user.avatar)
                    : user.avatar;

            return (
                <Image
                    src={avatarUrl}
                    alt={user.username || "User"}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                    unoptimized={
                        typeof avatarUrl === "string" &&
                        avatarUrl.startsWith("http")
                    }
                />
            );
        }

        const initial =
            user?.username?.charAt(0).toUpperCase() || "U";

        return (
            <div className="w-10 h-10 rounded-full bg-brand-purple flex items-center justify-center text-white font-semibold text-sm">
                {initial}
            </div>
        );
    };

    if (!mounted) {
        return (
            <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 lg:gap-4">
            {/* Browse foods */}
            {showAuthenticatedUI ? (
                <HeaderTooltip label="Explore foods">
                    <Link
                        href="/search"
                        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                            theme === "dark"
                                ? "hover:bg-white/10"
                                : "hover:bg-gray-50"
                        } ${
                            pathname === "/search"
                                ? "text-brand-orange"
                                : theme === "dark"
                                ? "text-white/75"
                                : "text-gray-600"
                        }`}
                        aria-label="Explore foods"
                    >
                        <UtensilsCrossed className="w-5 h-5" />

                        {pathname === "/search" && (
                            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-orange" />
                        )}
                    </Link>
                </HeaderTooltip>
            ) : (
                <Button
                    asChild
                    variant="brandSoft"
                    size="sm"
                    className="h-9 rounded-full px-3"
                >
                    <Link
                        href="/search"
                        aria-label="Explore foods"
                        title="Explore foods"
                        className="gap-2"
                    >
                        <UtensilsCrossed className="w-4 h-4" />
                        <span>Explore</span>
                    </Link>
                </Button>
            )}

            {/* Orders */}
            {showAuthenticatedUI && (
                <HeaderTooltip label="My orders">
                    <Link
                        href="/orders"
                        className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                            theme === "dark"
                                ? "hover:bg-white/10"
                                : "hover:bg-gray-50"
                        } ${
                            pathname === "/orders"
                                ? "text-brand-orange"
                                : theme === "dark"
                                ? "text-white/75"
                                : "text-gray-600"
                        }`}
                        aria-label="My orders"
                    >
                        <Package className="w-5 h-5" />

                        {pathname === "/orders" && (
                            <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-orange" />
                        )}
                    </Link>
                </HeaderTooltip>
            )}

            {/* Blog */}
            <HeaderTooltip label="Blog">
                <Link
                    href="/blog"
                    className={`relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                        theme === "dark"
                            ? "hover:bg-white/10"
                            : "hover:bg-gray-50"
                    } ${
                        pathname === "/blog" || pathname.startsWith("/blog/")
                            ? "text-brand-orange"
                            : theme === "dark"
                            ? "text-white/75"
                            : "text-gray-600"
                    }`}
                    aria-label="Blog"
                >
                    <BookOpen className="w-5 h-5" />

                    {(pathname === "/blog" || pathname.startsWith("/blog/")) && (
                        <span className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand-orange" />
                    )}
                </Link>
            </HeaderTooltip>

            {/* Notifications */}
            {showAuthenticatedUI && (
                <NotificationDropdown />
            )}

            {/* Cart */}
            {showAuthenticatedUI && (
                <CartDropdown />
            )}

            {/* User Actions */}
            {showAuthenticatedUI ? (
                <DropdownMenu modal={false}>
                    <HeaderTooltip label="Account menu" align="end">
                        <DropdownMenuTrigger
                            asChild
                            className="focus:outline-none"
                        >
                            <button
                                className={`inline-flex h-10 items-center gap-2 cursor-pointer rounded-full pl-0 pr-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 ${
                                    theme === "dark"
                                        ? "hover:bg-white/10"
                                        : "hover:bg-gray-50"
                                }`}
                                aria-label="Account menu"
                            >
                                {getAvatarContent()}

                                <span
                                    className={`hidden lg:inline text-sm font-medium ${
                                        theme === "dark"
                                            ? "text-white/90"
                                            : "text-brand-black"
                                    }`}
                                >
                                    {user?.username || "User"}
                                </span>
                            </button>
                        </DropdownMenuTrigger>
                    </HeaderTooltip>

                    <DropdownMenuContent
                        align="end"
                        alignOffset={0}
                        sideOffset={8}
                        className={`account-dropdown-content z-[90] w-56 min-w-[14rem] max-w-[14rem] shadow-lg border data-[state=open]:animate-none data-[state=closed]:animate-none data-[side=bottom]:slide-in-from-top-0 ${
                            theme === "dark"
                                ? "bg-[#12182b] border-white/12 text-white"
                                : "border-gray-200"
                        }`}
                    >
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {user?.username || "User"}
                                </p>

                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email ?? ""}
                                </p>
                            </div>
                        </DropdownMenuLabel>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/orders"
                                    className={`flex items-center justify-between cursor-pointer w-full py-2.5 px-3 transition-colors ${
                                        theme === "dark"
                                            ? "hover:bg-white/10"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Package
                                            className={`h-4 w-4 ${
                                                theme === "dark"
                                                    ? "text-white/70"
                                                    : "text-gray-600"
                                            }`}
                                        />

                                        <span className="text-sm">
                                            My orders
                                        </span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    href="/chat"
                                    className={`flex items-center justify-between cursor-pointer w-full py-2.5 px-3 transition-colors ${
                                        theme === "dark"
                                            ? "hover:bg-white/10"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageCircle
                                            className={`h-4 w-4 ${
                                                theme === "dark"
                                                    ? "text-white/70"
                                                    : "text-gray-600"
                                            }`}
                                        />

                                        <span className="text-sm">
                                            Messages
                                        </span>
                                    </div>

                                    {chatUnreadCount > 0 && (
                                        <span className="ml-2 h-5 min-w-[20px] px-1.5 bg-brand-orange text-white text-xs rounded-full flex items-center justify-center font-bold">
                                            {chatUnreadCount > 99
                                                ? "99+"
                                                : chatUnreadCount}
                                        </span>
                                    )}
                                </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                                <Link
                                    href="/blog"
                                    className={`flex items-center justify-between cursor-pointer w-full py-2.5 px-3 transition-colors ${
                                        theme === "dark"
                                            ? "hover:bg-white/10"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen
                                            className={`h-4 w-4 ${
                                                theme === "dark"
                                                    ? "text-white/70"
                                                    : "text-gray-600"
                                            }`}
                                        />

                                        <span className="text-sm">
                                            Blog
                                        </span>
                                    </div>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                                <Link
                                    href="/account"
                                    className={`flex items-center gap-2 py-2.5 px-3 transition-colors cursor-pointer ${
                                        theme === "dark"
                                            ? "hover:bg-white/10"
                                            : "hover:bg-gray-50"
                                    }`}
                                >
                                    <User
                                        className={`h-4 w-4 ${
                                            theme === "dark"
                                                ? "text-white/70"
                                                : "text-gray-600"
                                        }`}
                                    />

                                    <span className="text-sm">
                                        Profile
                                    </span>
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onSelect={(event) => {
                                event.preventDefault();
                                toggleTheme();
                            }}
                            aria-pressed={theme === "dark"}
                            className={`flex items-center justify-between py-2.5 px-3 transition-colors cursor-pointer ${
                                theme === "dark"
                                    ? "hover:bg-white/10"
                                    : "hover:bg-gray-50"
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                {theme === "dark" ? (
                                    <Moon className="h-4 w-4 text-white/70" />
                                ) : (
                                    <Sun className="h-4 w-4 text-gray-600" />
                                )}
                                <span className="text-sm">Dark mode</span>
                            </div>

                            <span
                                aria-hidden="true"
                                className={`relative h-5 w-9 rounded-full transition-colors ${
                                    theme === "dark" ? "bg-brand-orange" : "bg-gray-300"
                                }`}
                            >
                                <span
                                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                                        theme === "dark" ? "translate-x-[18px]" : "translate-x-0.5"
                                    }`}
                                />
                            </span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className={`flex items-center gap-2 py-2.5 px-3 transition-colors cursor-pointer text-red-600 focus:text-red-600 ${
                                theme === "dark"
                                    ? "hover:bg-red-500/15"
                                    : "hover:bg-red-50"
                            }`}
                        >
                            <LogOut className="h-4 w-4" />

                            <span className="text-sm">
                                {isLoggingOut
                                    ? "Logging out..."
                                    : "Log out"}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ) : (
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={async () => {
                            try {
                                await loginWithKeycloak({
                                    redirectPath: "/",
                                });
                            } catch (error) {
                                const message =
                                    error instanceof Error
                                        ? error.message
                                        : "Unable to start Keycloak sign in.";

                                toast.error(message);
                            }
                        }}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${
                            theme === "dark"
                                ? "text-white/80 hover:text-white"
                                : "text-gray-700 hover:text-gray-900"
                        }`}
                    >
                        Sign in
                    </button>

                    <Button
                        type="button"
                        onClick={async () => {
                            try {
                                await loginWithKeycloak({
                                    redirectPath: "/",
                                    action: "register",
                                });
                            } catch (error) {
                                const message =
                                    error instanceof Error
                                        ? error.message
                                        : "Unable to start Keycloak registration.";

                                toast.error(message);
                            }
                        }}
                        variant="brand"
                        size="sm"
                        className="px-4"
                    >
                        Sign up
                    </Button>
                </div>
            )}
        </div>
    );
}
