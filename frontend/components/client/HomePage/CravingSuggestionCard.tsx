"use client";

import { isRecommendationUnauthorizedError, recommendationApi } from "@/lib/api/recommendationApi";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import HeaderTooltip from "@/components/header/HeaderTooltip";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { AxiosError } from "axios";
import {
    Bot,
    ChefHat,
    Copy,
    Loader2,
    MessageCircle,
    SendHorizontal,
    Sparkles,
    UserRound,
    X,
} from "lucide-react";
import Link from "next/link";
import { type ComponentProps, type FormEvent, type KeyboardEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const quickPrompts = ["Cay, có nước", "Ăn tối nhẹ bụng", "Nhiều protein", "Món ngọt mát"];
const MAX_CONTEXT_HISTORY_MESSAGES = 6;
const MAX_CONTEXT_HISTORY_CHARS = 4000;

type AssistantMessageRole = "user" | "assistant";

interface AssistantMessage {
    id: number;
    role: AssistantMessageRole;
    content: string;
    isError?: boolean;
}

const assistantMarkdownComponents: NonNullable<ComponentProps<typeof ReactMarkdown>["components"]> = {
    h1: ({ children }) => <h1 className="my-2 text-sm font-semibold leading-6">{children}</h1>,
    h2: ({ children }) => <h2 className="my-2 text-sm font-semibold leading-6">{children}</h2>,
    h3: ({ children }) => <h3 className="my-2 text-sm font-semibold leading-6">{children}</h3>,
    h4: ({ children }) => <h4 className="my-2 text-sm font-semibold leading-6">{children}</h4>,
    h5: ({ children }) => <h5 className="my-2 text-sm font-semibold leading-6">{children}</h5>,
    h6: ({ children }) => <h6 className="my-2 text-sm font-semibold leading-6">{children}</h6>,
    p: ({ children }) => <p className="my-1.5 text-sm leading-6 last:mb-0">{children}</p>,
    ul: ({ children }) => <ul className="my-1.5 list-disc space-y-1 pl-5 text-sm leading-6">{children}</ul>,
    ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-1 pl-5 text-sm leading-6">{children}</ol>,
    li: ({ children }) => <li className="text-sm leading-6">{children}</li>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
    blockquote: ({ children }) => (
        <blockquote className="my-2 border-l-2 border-brand-orange/40 pl-3 text-sm leading-6 text-gray-600">
            {children}
        </blockquote>
    ),
    code: ({ children }) => <code className="rounded bg-gray-100 px-1 py-0.5 text-sm leading-6">{children}</code>,
    pre: ({ children }) => (
        <pre className="my-2 overflow-x-auto rounded-lg bg-gray-100 p-2 text-sm leading-6">{children}</pre>
    ),
    a: ({ children, href }) => (
        <a href={href} className="text-sm font-medium text-brand-orange underline underline-offset-2">
            {children}
        </a>
    ),
};

const buildConversationContext = (messages: AssistantMessage[], prompt: string) => {
    const recentMessages = messages
        .filter((message) => !message.isError)
        .slice(-MAX_CONTEXT_HISTORY_MESSAGES)
        .map((message) => `${message.role === "user" ? "User" : "Assistant"}: ${message.content}`);
    const includedHistory: string[] = [];
    let remainingChars = MAX_CONTEXT_HISTORY_CHARS;

    for (let index = recentMessages.length - 1; index >= 0; index -= 1) {
        const entry = recentMessages[index];
        const separatorLength = includedHistory.length > 0 ? 2 : 0;
        const availableChars = remainingChars - separatorLength;
        if (availableChars <= 0) break;

        if (entry.length > availableChars) {
            if (includedHistory.length === 0) {
                includedHistory.unshift(entry.slice(-availableChars));
            }
            break;
        }

        includedHistory.unshift(entry);
        remainingChars -= entry.length + separatorLength;
    }

    return [...includedHistory, `User: ${prompt}`].join("\n\n");
};

export default function CravingSuggestionCard() {
    const { theme } = useClientTheme();
    const { isAuthenticated, user } = useAuthStore();
    const unreadCountMap = useChatStore((state) => state.unreadCountMap);
    const [open, setOpen] = useState(false);
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<AssistantMessage[]>([]);
    const [hasUnreadResult, setHasUnreadResult] = useState(false);
    const panelOpenRef = useRef(false);
    const inFlightSuggestRef = useRef<AbortController | null>(null);
    const requestSeqRef = useRef(0);
    const messageSeqRef = useRef(0);
    const messagesScrollRef = useRef<HTMLDivElement | null>(null);
    const composerComposingRef = useRef(false);
    const chatUnreadCount = Object.values(unreadCountMap).reduce((sum, count) => sum + (count || 0), 0);
    const showMessagesAction = isAuthenticated && !!user;

    const createMessage = (role: AssistantMessageRole, content: string, isError = false): AssistantMessage => {
        messageSeqRef.current += 1;
        return {
            id: messageSeqRef.current,
            role,
            content,
            isError,
        };
    };

    useEffect(() => {
        if (!open) return;

        const frameId = window.requestAnimationFrame(() => {
            const scrollContainer = messagesScrollRef.current;
            scrollContainer?.scrollTo({
                top: scrollContainer.scrollHeight,
                behavior: "smooth",
            });
        });

        return () => window.cancelAnimationFrame(frameId);
    }, [loading, messages, open]);

    const setPanelOpen = (nextOpen: boolean) => {
        panelOpenRef.current = nextOpen;
        setOpen(nextOpen);
        if (nextOpen) {
            setHasUnreadResult(false);
        }
    };

    const handleSuggest = async () => {
        const trimmed = context.trim();
        if (!trimmed) {
            toast.error("Nhập cảm giác thèm món trước nhé.");
            return;
        }

        // Replace previous pending AI request so it doesn't block newer intent.
        if (inFlightSuggestRef.current) {
            inFlightSuggestRef.current.abort();
        }
        const controller = new AbortController();
        inFlightSuggestRef.current = controller;
        const seq = requestSeqRef.current + 1;
        requestSeqRef.current = seq;
        const conversationContext = buildConversationContext(messages, trimmed);

        setLoading(true);
        setPanelOpen(true);
        setContext("");
        setMessages((currentMessages) => [...currentMessages, createMessage("user", trimmed)]);
        setHasUnreadResult(false);
        try {
            const result = await recommendationApi.suggestFoodByCraving(conversationContext, { signal: controller.signal });
            // Ignore stale responses when a newer request has already started.
            if (seq !== requestSeqRef.current) return;
            setMessages((currentMessages) => [
                ...currentMessages,
                createMessage("assistant", result.response || "Chưa có gợi ý phù hợp."),
            ]);
            setHasUnreadResult(!panelOpenRef.current);
            toast.success("AI đã có gợi ý mới.");
        } catch (error) {
            if (error instanceof AxiosError && error.code === "ERR_CANCELED") {
                return;
            }
            if (seq !== requestSeqRef.current) return;
            if (isRecommendationUnauthorizedError(error)) {
                setMessages((currentMessages) => [
                    ...currentMessages,
                    createMessage("assistant", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để dùng AI.", true),
                ]);
                setHasUnreadResult(!panelOpenRef.current);
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để dùng AI.");
                return;
            }
            console.error("Suggest food failed:", error);
            setMessages((currentMessages) => [
                ...currentMessages,
                createMessage("assistant", "Mình chưa thể gợi ý món ăn lúc này. Bạn vui lòng thử lại sau nhé.", true),
            ]);
            setHasUnreadResult(!panelOpenRef.current);
            toast.error("Chưa thể gợi ý món ăn. Vui lòng thử lại.");
        } finally {
            if (seq === requestSeqRef.current) {
                setLoading(false);
                inFlightSuggestRef.current = null;
            }
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void handleSuggest();
    };

    const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
            if (event.nativeEvent.isComposing || composerComposingRef.current || event.keyCode === 229) {
                return;
            }
            if (event.repeat) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            void handleSuggest();
        }
    };

    const handleCopySuggestion = async (suggestion: string) => {
        if (!suggestion.trim()) return;
        try {
            await navigator.clipboard.writeText(suggestion);
            toast.success("Đã copy gợi ý AI.");
        } catch {
            toast.error("Không copy được, thử lại nhé.");
        }
    };

    const handleOpenPanel = () => {
        setPanelOpen(true);
    };

    return (
        <>
            <div className="fixed bottom-24 right-3 z-50 sm:bottom-6 sm:right-6">
                {!open && showMessagesAction && (
                    <div className="mb-2 flex justify-end">
                        <HeaderTooltip label="Messages" align="end">
                            <Link
                                href="/chat"
                                aria-label="Messages"
                                className={`relative inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/35 ${
                                    theme === "dark"
                                        ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                                        : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <MessageCircle className="h-5 w-5" />
                                {chatUnreadCount > 0 && (
                                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-orange px-1.5 text-xs font-bold text-white shadow-md">
                                        {chatUnreadCount > 99 ? "99+" : chatUnreadCount}
                                    </span>
                                )}
                            </Link>
                        </HeaderTooltip>
                    </div>
                )}

                {open ? (
                    <section
                        aria-label="AI gợi ý món ăn"
                        className="flex h-[min(78dvh,640px)] w-[min(94vw,420px)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_20px_70px_rgba(25,23,32,0.24)]"
                    >
                        <div className="flex items-start justify-between gap-3 bg-gradient-to-br from-brand-orange via-[#f26d4d] to-[#ffcf54] px-4 py-4 text-white">
                            <div className="flex min-w-0 items-start gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 ring-1 ring-white/30">
                                    <ChefHat className="h-5 w-5" aria-hidden="true" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold leading-5">AI Food Assistant</p>
                                    <p className="mt-0.5 text-xs leading-5 text-white/85">Gợi ý món hợp mood hôm nay</p>
                                </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => setPanelOpen(false)}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                                    aria-label="Đóng gợi ý món"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div
                            ref={messagesScrollRef}
                            className={`flex-1 overflow-y-auto px-4 py-4 ${
                                theme === "dark" ? "bg-white/5" : "bg-gradient-to-b from-orange-50/80 via-white to-white"
                            }`}
                        >
                            <div className="space-y-3">
                                <div className="flex items-start gap-2.5">
                                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                                        <Bot className="h-4 w-4" aria-hidden="true" />
                                    </div>
                                    <div className="max-w-[82%] rounded-2xl rounded-tl-md border border-orange-100 bg-white px-3.5 py-3 text-sm leading-6 text-gray-800 shadow-sm">
                                        Mình đang nghe đây. Bạn muốn ăn kiểu gì?
                                    </div>
                                </div>

                                {messages.length === 0 && !loading && (
                                    <div className="flex flex-wrap gap-2 pl-10">
                                        {quickPrompts.map((prompt) => (
                                            <button
                                                key={prompt}
                                                type="button"
                                                onClick={() => setContext(prompt)}
                                                className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-xs font-medium text-orange-700 transition hover:border-brand-orange/60 hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30"
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {messages.map((message) =>
                                    message.role === "user" ? (
                                        <div key={message.id} className="flex items-start justify-end gap-2.5">
                                            <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-brand-orange px-3.5 py-3 text-sm font-medium leading-6 text-white shadow-sm">
                                                {message.content}
                                            </div>
                                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                                                <UserRound className="h-4 w-4" aria-hidden="true" />
                                            </div>
                                        </div>
                                    ) : (
                                        <div key={message.id} className="flex items-start gap-2.5">
                                            <div
                                                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                                                    message.isError
                                                        ? "bg-red-50 text-red-600"
                                                        : "bg-brand-orange/10 text-brand-orange"
                                                }`}
                                            >
                                                <Bot className="h-4 w-4" aria-hidden="true" />
                                            </div>
                                            <div
                                                className={`relative max-w-[88%] rounded-2xl rounded-tl-md border px-3.5 py-3 text-sm leading-6 shadow-sm ${
                                                    message.isError
                                                        ? "border-red-100 bg-red-50 pr-3.5 text-red-700"
                                                        : "border-orange-100 bg-white pr-10 text-gray-800"
                                                }`}
                                            >
                                                <ReactMarkdown components={assistantMarkdownComponents}>
                                                    {message.content}
                                                </ReactMarkdown>
                                                {!message.isError && (
                                                    <button
                                                        type="button"
                                                        onClick={() => void handleCopySuggestion(message.content)}
                                                        className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-orange-700 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30"
                                                        aria-label="Copy gợi ý AI"
                                                    >
                                                        <Copy className="h-3.5 w-3.5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ),
                                )}

                                {loading && (
                                    <div className="flex items-start gap-2.5" role="status" aria-live="polite">
                                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                                            <Bot className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <div className="flex max-w-[82%] items-center gap-2 rounded-2xl rounded-tl-md border border-orange-100 bg-white px-3.5 py-3 text-sm leading-6 text-gray-700 shadow-sm">
                                            <Loader2 className="h-4 w-4 animate-spin text-brand-orange" aria-hidden="true" />
                                            AI đang chọn món phù hợp...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="border-t border-gray-200 bg-white p-3">
                            <div className="flex items-end gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-2 focus-within:border-brand-orange/70 focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-orange/15">
                                <textarea
                                    value={context}
                                    onChange={(event) => setContext(event.target.value)}
                                    onKeyDown={handleComposerKeyDown}
                                    onCompositionStart={() => {
                                        composerComposingRef.current = true;
                                    }}
                                    onCompositionEnd={() => {
                                        composerComposingRef.current = false;
                                    }}
                                    placeholder="Bạn đang thèm món gì?"
                                    rows={1}
                                    className="max-h-24 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm leading-5 text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    disabled={!context.trim()}
                                    className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-orange text-white shadow-sm transition hover:bg-brand-orange/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/35 disabled:cursor-not-allowed disabled:bg-gray-300"
                                    aria-label={loading ? "Gửi prompt mới cho AI" : "Gửi yêu cầu gợi ý món"}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
                                </button>
                            </div>
                        </form>
                    </section>
                ) : (
                    <button
                        type="button"
                        onClick={handleOpenPanel}
                        className="relative inline-flex h-14 items-center gap-2 rounded-full bg-brand-orange px-4 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(238,77,45,0.34)] transition hover:-translate-y-0.5 hover:bg-brand-orange/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/35"
                    >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        </span>
                        <span className="leading-none">{loading ? "AI đang xử lý" : "AI gợi ý món"}</span>
                        {hasUnreadResult && !loading && (
                            <span className="absolute -right-1 -top-1 inline-flex h-3 w-3">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                            </span>
                        )}
                    </button>
                )}
            </div>

        </>
    );
}
