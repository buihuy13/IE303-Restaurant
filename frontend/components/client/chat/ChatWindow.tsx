"use client";

import { restaurantApi } from "@/lib/api/restaurantApi";
import { getRestaurantDetailHref } from "@/lib/utils/restaurantNavigation";
import { Message } from "@/types";
import { ArrowLeft, Loader2, Paperclip, Send } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const normalizeId = (value: string | null | undefined) => (value ?? "").trim().toLowerCase();
const isSameId = (left: string | null | undefined, right: string | null | undefined) =>
    normalizeId(left) === normalizeId(right);
const normalizeMessageParticipantIds = (message: Message, currentUserId: string, partnerId: string): Message => {
    const sender = normalizeId(message.senderId);
    const receiver = normalizeId(message.receiverId);
    const current = normalizeId(currentUserId);
    const partner = normalizeId(partnerId);
    if (sender === current && receiver === current) {
        return { ...message, senderId: currentUserId, receiverId: partnerId };
    }
    if (sender === partner && receiver === partner) {
        return { ...message, senderId: partnerId, receiverId: currentUserId };
    }
    return message;
};
const toTimestampMs = (value: unknown) => {
    if (value == null) return 0;
    if (value instanceof Date) {
        const ms = value.getTime();
        return Number.isFinite(ms) ? ms : 0;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }
    const raw = typeof value === "string" ? value.trim() : String(value).trim();
    if (!raw) return 0;
    if (/^\d+$/.test(raw)) {
        const numeric = Number(raw);
        if (Number.isFinite(numeric)) {
            return raw.length <= 10 ? numeric * 1000 : numeric;
        }
    }
    const normalized = raw.replace(" ", "T").replace(/\.(\d{3})\d+/, ".$1");
    const needsTimezone = !/[zZ]$/.test(normalized) && !/[+-]\d{2}:\d{2}$/.test(normalized);
    const withTimezone = needsTimezone ? `${normalized}Z` : normalized;
    const parsed = new Date(withTimezone).getTime();
    if (!Number.isNaN(parsed)) {
        return parsed;
    }

    if (typeof value === "object") {
        const candidate = value as {
            epochMilli?: number;
            epochSecond?: number;
            nano?: number;
            seconds?: number;
            nanos?: number;
            year?: number;
            monthValue?: number;
            month?: number;
            dayOfMonth?: number;
            day?: number;
            hour?: number;
            minute?: number;
            second?: number;
        };
        if (typeof candidate.epochMilli === "number" && Number.isFinite(candidate.epochMilli)) {
            return candidate.epochMilli;
        }
        const secondPart =
            typeof candidate.epochSecond === "number"
                ? candidate.epochSecond
                : typeof candidate.seconds === "number"
                  ? candidate.seconds
                  : null;
        if (secondPart != null && Number.isFinite(secondPart)) {
            const nanoPart =
                typeof candidate.nano === "number"
                    ? candidate.nano
                    : typeof candidate.nanos === "number"
                      ? candidate.nanos
                      : 0;
            return secondPart * 1000 + Math.floor(nanoPart / 1_000_000);
        }

        const year = typeof candidate.year === "number" ? candidate.year : null;
        const monthRaw =
            typeof candidate.monthValue === "number"
                ? candidate.monthValue
                : typeof candidate.month === "number"
                  ? candidate.month
                  : null;
        const day =
            typeof candidate.dayOfMonth === "number"
                ? candidate.dayOfMonth
                : typeof candidate.day === "number"
                  ? candidate.day
                  : null;
        if (year != null && monthRaw != null && day != null) {
            const hour = typeof candidate.hour === "number" ? candidate.hour : 0;
            const minute = typeof candidate.minute === "number" ? candidate.minute : 0;
            const second = typeof candidate.second === "number" ? candidate.second : 0;
            const nano =
                typeof candidate.nano === "number"
                    ? candidate.nano
                    : typeof candidate.nanos === "number"
                      ? candidate.nanos
                      : 0;
            const utcMs = Date.UTC(year, monthRaw - 1, day, hour, minute, second, Math.floor(nano / 1_000_000));
            if (Number.isFinite(utcMs)) {
                return utcMs;
            }
        }
    }

    return 0;
};

interface ChatWindowProps {
    messages: Message[];
    currentUserId: string;
    partnerId: string;
    partnerName: string;
    onSendMessage: (content: string, receiverId: string) => void;
    isConnected: boolean;
    isLoading?: boolean;
    onMarkAsRead?: () => void;
    onBack?: () => void; // For mobile back button
}

export default function ChatWindow({
    messages,
    currentUserId,
    partnerId,
    partnerName,
    onSendMessage,
    isConnected,
    isLoading = false,
    onMarkAsRead,
    onBack,
}: ChatWindowProps) {
    const [inputValue, setInputValue] = useState("");
    const [shopHref, setShopHref] = useState("/search?type=restaurants");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const isInitialLoadRef = useRef(true);
    const lastMessageCountRef = useRef(0);
    const shouldAutoScrollRef = useRef(true);
    const hasMarkedAsReadRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        if (!partnerId?.trim()) return;

        restaurantApi
            .getRestaurantByMerchantId(partnerId.trim())
            .then((res) => {
                const slug = typeof res.data?.slug === "string" ? res.data.slug.trim() : "";
                if (cancelled || !slug) return;
                const href = getRestaurantDetailHref({ slug });
                if (href) setShopHref(href);
            })
            .catch(() => {
                // Partner may not be a merchant — keep search fallback.
            });

        return () => {
            cancelled = true;
        };
    }, [partnerId]);

    // Check if user is near bottom of scroll container
    const isNearBottom = () => {
        if (!messagesContainerRef.current) return true;
        const container = messagesContainerRef.current;
        const threshold = 100;
        return container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    };

    // Scroll to bottom helper
    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            container.scrollTo({
                top: container.scrollHeight,
                behavior,
            });
        }
    };

    // Scroll to bottom when messages change
    useEffect(() => {
        if (isLoading) {
            isInitialLoadRef.current = true;
            return;
        }

        // Use filtered and sorted messages for scroll detection
        const filteredMessages = messages.filter((message) => {
            const isFromCurrentUser = isSameId(message.senderId, currentUserId);
            const isToCurrentUser = isSameId(message.receiverId, currentUserId);
            const isFromPartner = isSameId(message.senderId, partnerId);
            const isToPartner = isSameId(message.receiverId, partnerId);
            return (isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser);
        });

        const messageCount = filteredMessages.length;
        const isNewMessage = messageCount > lastMessageCountRef.current;
        lastMessageCountRef.current = messageCount;

        if (isInitialLoadRef.current && !isLoading && filteredMessages.length > 0) {
            requestAnimationFrame(() => {
                setTimeout(() => {
                    scrollToBottom("auto");
                    isInitialLoadRef.current = false;
                    shouldAutoScrollRef.current = true;
                }, 50);
            });
        } else if (!isLoading && filteredMessages.length > 0 && isNewMessage) {
            if (shouldAutoScrollRef.current || isNearBottom()) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        scrollToBottom("smooth");
                    }, 30);
                });
            }
        }
    }, [messages, isLoading, currentUserId, partnerId]);

    // Mark messages as read
    useEffect(() => {
        if (!isLoading && onMarkAsRead && !hasMarkedAsReadRef.current) {
            const timer = setTimeout(() => {
                onMarkAsRead();
                hasMarkedAsReadRef.current = true;
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isLoading, onMarkAsRead]);

    // Reset hasMarkedAsReadRef when room changes
    useEffect(() => {
        hasMarkedAsReadRef.current = false;
    }, [partnerId]);

    // Track scroll position
    useEffect(() => {
        const container = messagesContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            if (!isNearBottom()) {
                shouldAutoScrollRef.current = false;
            } else {
                shouldAutoScrollRef.current = true;
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    const handleSend = () => {
        const trimmedContent = inputValue.trim();
        if (!trimmedContent) return;

        shouldAutoScrollRef.current = true;
        onSendMessage(trimmedContent, partnerId);
        setInputValue("");
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Filter messages to only show messages between currentUserId and partnerId
    // This prevents showing messages from other conversations
    const normalizedMessages = messages.map((message) => normalizeMessageParticipantIds(message, currentUserId, partnerId));
    const filteredMessages = normalizedMessages.filter((message) => {
        const isFromCurrentUser = isSameId(message.senderId, currentUserId);
        const isToCurrentUser = isSameId(message.receiverId, currentUserId);
        const isFromPartner = isSameId(message.senderId, partnerId);
        const isToPartner = isSameId(message.receiverId, partnerId);
        
        // Only show messages where:
        // - Current user sent to partner, OR
        // - Partner sent to current user
        return (isFromCurrentUser && isToPartner) || (isFromPartner && isToCurrentUser);
    });

    // Remove duplicate messages based on id, content, senderId, receiverId, and timestamp
    const uniqueMessages = filteredMessages.reduce((acc, message) => {
        const existingIndex = acc.findIndex((m) => {
            const sameId = m.id === message.id;
            const sameContent = m.content === message.content;
            const sameSender = isSameId(m.senderId, message.senderId);
            const sameReceiver = isSameId(m.receiverId, message.receiverId);
            const timeDiff = Math.abs(toTimestampMs(m.timestamp) - toTimestampMs(message.timestamp));
            const sameTime = timeDiff < 1000; // Within 1 second
            
            return sameId || (sameContent && sameSender && sameReceiver && sameTime);
        });
        
        if (existingIndex === -1) {
            acc.push(message);
        }
        
        return acc;
    }, [] as Message[]);

    // Sort messages by timestamp
    const sortedMessages = [...uniqueMessages].sort(
        (a, b) => toTimestampMs(a.timestamp) - toTimestampMs(b.timestamp)
    );

    return (
        <div className="flex h-full flex-col bg-white">
            {/* Header - Sticky Top */}
            <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    {/* Mobile Back Button */}
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="rounded-full p-2 transition-colors hover:bg-gray-100 lg:hidden"
                            aria-label="Go back to chat list"
                            title="Go back"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                    )}

                    {/* Avatar */}
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-orange to-orange-600 text-sm font-bold text-white shadow-sm">
                        <span>{partnerName.charAt(0).toUpperCase()}</span>
                    </div>

                    {/* Name */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base truncate">{partnerName}</h3>
                    </div>

                    {/* Visit Shop Button */}
                    <Link
                        href={shopHref}
                        className="whitespace-nowrap rounded-full border border-brand-orange/40 px-3 py-1.5 text-xs font-semibold text-brand-orange transition-colors hover:bg-brand-orange/10"
                    >
                        Visit Shop
                    </Link>
                </div>
            </div>

            {/* Messages Area - Scrollable */}
            <div
                ref={messagesContainerRef}
                className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-gray-50 p-4 scrollbar-hide"
            >
                {isLoading && sortedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px]">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                    </div>
                ) : sortedMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full min-h-[400px] p-6">
                        <div className="rounded-3xl border border-gray-200/90 bg-white p-8 text-center shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
                            <div className="text-5xl mb-3">👋</div>
                            <p className="text-gray-900 font-semibold">No messages yet</p>
                            <p className="text-sm text-gray-600 mt-1">Send a message to start the conversation.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {sortedMessages.map((message) => {
                            const isOwnMessage = isSameId(message.senderId, currentUserId);

                            return (
                                <div
                                    key={message.id}
                                    className={`flex gap-2 ${isOwnMessage ? "justify-end items-end" : "justify-start items-start"}`}
                                >
                                    {/* Avatar for received messages */}
                                    {!isOwnMessage && (
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                                            <span>{partnerName.charAt(0).toUpperCase()}</span>
                                        </div>
                                    )}

                                    {/* Message Bubble */}
                                    <div className={`flex flex-shrink-0 flex-col ${isOwnMessage ? "items-end" : "items-start"}`}>
                                        <div
                                            className={`max-w-[75%] md:max-w-[65%] min-w-[120px] rounded-2xl px-3 py-2 shadow-sm inline-block text-sm md:text-base leading-relaxed whitespace-normal break-words ${
                                                isOwnMessage
                                                    ? "bg-brand-orange text-white rounded-tr-2xl rounded-bl-2xl"
                                                    : "bg-white text-gray-900 border border-gray-200 rounded-tl-2xl rounded-br-2xl"
                                            }`}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {isLoading && sortedMessages.length > 0 && (
                            <div className="flex justify-center py-2">
                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            {/* Input Area - Sticky Bottom */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4">
                <div className="flex items-center gap-2">
                    {/* Image/Attachment Button */}
                    <button
                        type="button"
                        className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-orange-50 hover:text-brand-orange"
                        title="Send image"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>

                    {/* Input Field */}
                    <Input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        onFocus={() => {
                            if (onMarkAsRead && !hasMarkedAsReadRef.current) {
                                onMarkAsRead();
                                hasMarkedAsReadRef.current = true;
                            }
                        }}
                        onClick={() => {
                            if (onMarkAsRead && !hasMarkedAsReadRef.current) {
                                onMarkAsRead();
                                hasMarkedAsReadRef.current = true;
                            }
                        }}
                        placeholder={isConnected ? "Type a message..." : "Connecting... you can still press Send"}
                        className="h-11 flex-1 rounded-full border border-gray-200 bg-gray-50 px-4 py-2.5 focus:bg-white disabled:cursor-not-allowed disabled:bg-gray-100"
                    />

                    {/* Send Button */}
                    <Button
                        title="Send message"
                        onClick={handleSend}
                        disabled={!inputValue.trim()}
                        variant="brand"
                        size="icon"
                        className="size-11 rounded-full shadow-md transition-transform hover:scale-105 hover:shadow-lg active:scale-95 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-white disabled:hover:scale-100"
                    >
                        <Send className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
