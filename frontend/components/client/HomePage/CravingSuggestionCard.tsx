"use client";

import { isRecommendationUnauthorizedError, recommendationApi } from "@/lib/api/recommendationApi";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { AxiosError } from "axios";
import {
    Bot,
    ChefHat,
    Copy,
    Expand,
    Loader2,
    Minimize2,
    Moon,
    SendHorizontal,
    Sparkles,
    Sun,
    UserRound,
    X,
} from "lucide-react";
import { type FormEvent, type KeyboardEvent, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const quickPrompts = ["Cay, có nước", "Ăn tối nhẹ bụng", "Nhiều protein", "Món ngọt mát"];

export default function CravingSuggestionCard() {
    const { theme, toggleTheme } = useClientTheme();
    const [open, setOpen] = useState(false);
    const [context, setContext] = useState("");
    const [lastPrompt, setLastPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const [hasUnreadResult, setHasUnreadResult] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [readingMode, setReadingMode] = useState<"compact" | "comfortable">("comfortable");
    const panelOpenRef = useRef(false);
    const inFlightSuggestRef = useRef<AbortController | null>(null);
    const requestSeqRef = useRef(0);

    const zoomTypographyClass =
        readingMode === "comfortable"
            ? "prose prose-lg max-w-none text-[18px] leading-8 text-gray-800 prose-headings:mt-6 prose-headings:mb-3 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:my-3 prose-p:leading-8 prose-li:my-2 prose-li:leading-8 prose-strong:font-semibold prose-strong:text-gray-900 prose-hr:my-6 prose-hr:border-orange-200"
            : "prose prose-base max-w-none text-[16px] leading-7 text-gray-800 prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-2 prose-p:leading-7 prose-li:my-1 prose-li:leading-7 prose-strong:font-semibold prose-strong:text-gray-900 prose-hr:my-4 prose-hr:border-orange-200";

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

        setLoading(true);
        setPanelOpen(true);
        setLastPrompt(trimmed);
        setContext("");
        setSuggestion("");
        setHasUnreadResult(false);
        try {
            const result = await recommendationApi.suggestFoodByCraving(trimmed, { signal: controller.signal });
            // Ignore stale responses when a newer request has already started.
            if (seq !== requestSeqRef.current) return;
            setSuggestion(result.response || "Chưa có gợi ý phù hợp.");
            setHasUnreadResult(!panelOpenRef.current);
            toast.success("AI đã có gợi ý mới.");
        } catch (error) {
            if (error instanceof AxiosError && error.code === "ERR_CANCELED") {
                return;
            }
            if (isRecommendationUnauthorizedError(error)) {
                toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để dùng AI.");
                return;
            }
            console.error("Suggest food failed:", error);
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
            event.preventDefault();
            void handleSuggest();
        }
    };

    const handleCopySuggestion = async () => {
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
                {!open && (
                    <div className="mb-2 flex justify-end">
                        <button
                            type="button"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/35 ${
                                theme === "dark"
                                    ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                                    : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </button>
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
                                    onClick={toggleTheme}
                                    aria-label="Toggle theme"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                                >
                                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                                </button>
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

                                {lastPrompt && (
                                    <div className="flex items-start justify-end gap-2.5">
                                        <div className="max-w-[82%] rounded-2xl rounded-tr-md bg-brand-orange px-3.5 py-3 text-sm font-medium leading-6 text-white shadow-sm">
                                            {lastPrompt}
                                        </div>
                                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-900 text-white">
                                            <UserRound className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                    </div>
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

                                {suggestion && !loading && (
                                    <div className="flex items-start gap-2.5">
                                        <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-orange/10 text-brand-orange">
                                            <Bot className="h-4 w-4" aria-hidden="true" />
                                        </div>
                                        <div className="max-w-[88%] overflow-hidden rounded-2xl rounded-tl-md border border-orange-100 bg-white shadow-sm">
                                            <div className="flex items-center justify-between gap-2 border-b border-orange-100 px-3.5 py-2.5">
                                                <div className="inline-flex min-w-0 items-center gap-2 text-xs font-semibold uppercase tracking-wide text-orange-700">
                                                    <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                                                    <span className="truncate">Gợi ý từ AI</span>
                                                </div>
                                                <div className="flex shrink-0 items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsZoomed(true)}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-orange-700 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30"
                                                        aria-label="Phóng to gợi ý AI"
                                                    >
                                                        <Expand className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCopySuggestion}
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-orange-700 transition hover:bg-orange-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30"
                                                        aria-label="Copy gợi ý AI"
                                                    >
                                                        <Copy className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="max-h-[34vh] overflow-y-auto px-3.5 py-3">
                                                <div className="prose prose-sm max-w-none text-gray-800 prose-headings:my-2 prose-headings:text-gray-900 prose-h1:text-2xl prose-h1:font-semibold prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-h3:font-semibold prose-p:my-1.5 prose-p:leading-relaxed prose-li:my-0.5 prose-strong:text-gray-900">
                                                    <ReactMarkdown>{suggestion}</ReactMarkdown>
                                                </div>
                                            </div>
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

            {isZoomed && suggestion && (
                <div
                    className="fixed inset-0 z-[60] bg-black/45 p-3 sm:p-6"
                    onClick={() => setIsZoomed(false)}
                    role="dialog"
                    aria-modal="true"
                    aria-label="Kết quả gợi ý AI"
                >
                    <div
                        className="mx-auto flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">Kết quả AI</p>
                            <div className="flex items-center gap-2">
                                <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-0.5">
                                    <button
                                        type="button"
                                        onClick={() => setReadingMode("compact")}
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            readingMode === "compact"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-600 hover:text-gray-800"
                                        }`}
                                    >
                                        Compact
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReadingMode("comfortable")}
                                        className={`rounded px-2 py-1 text-xs font-medium ${
                                            readingMode === "comfortable"
                                                ? "bg-white text-gray-900 shadow-sm"
                                                : "text-gray-600 hover:text-gray-800"
                                        }`}
                                    >
                                        Comfortable
                                    </button>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsZoomed(false)}
                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    <Minimize2 className="h-3.5 w-3.5" />
                                    Thu nhỏ
                                </button>
                            </div>
                        </div>
                        <div className="h-full overflow-y-auto bg-orange-50/60 px-4 py-5 sm:px-8">
                            <div className={zoomTypographyClass}>
                                <ReactMarkdown>{suggestion}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
