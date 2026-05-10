"use client";

import { isRecommendationUnauthorizedError, recommendationApi } from "@/lib/api/recommendationApi";
import { useClientTheme } from "@/components/providers/ClientThemeProvider";
import { AxiosError } from "axios";
import { Copy, Expand, Minimize2, Moon, Sparkles, Sun, X } from "lucide-react";
import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

export default function CravingSuggestionCard() {
    const { theme, toggleTheme } = useClientTheme();
    const [open, setOpen] = useState(false);
    const [context, setContext] = useState("");
    const [loading, setLoading] = useState(false);
    const [suggestion, setSuggestion] = useState("");
    const [hasUnreadResult, setHasUnreadResult] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);
    const [readingMode, setReadingMode] = useState<"compact" | "comfortable">("comfortable");
    const inFlightSuggestRef = useRef<AbortController | null>(null);
    const requestSeqRef = useRef(0);

    const zoomTypographyClass =
        readingMode === "comfortable"
            ? "prose prose-lg max-w-none text-[18px] leading-8 text-gray-800 prose-headings:mt-6 prose-headings:mb-3 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-gray-900 prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-p:my-3 prose-p:leading-8 prose-li:my-2 prose-li:leading-8 prose-strong:font-semibold prose-strong:text-gray-900 prose-hr:my-6 prose-hr:border-orange-200"
            : "prose prose-base max-w-none text-[16px] leading-7 text-gray-800 prose-headings:mt-4 prose-headings:mb-2 prose-headings:font-semibold prose-headings:text-gray-900 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:my-2 prose-p:leading-7 prose-li:my-1 prose-li:leading-7 prose-strong:font-semibold prose-strong:text-gray-900 prose-hr:my-4 prose-hr:border-orange-200";

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
        setOpen(false);
        try {
            const result = await recommendationApi.suggestFoodByCraving(trimmed, { signal: controller.signal });
            // Ignore stale responses when a newer request has already started.
            if (seq !== requestSeqRef.current) return;
            setSuggestion(result.response || "Chưa có gợi ý phù hợp.");
            setHasUnreadResult(true);
            toast.success("AI đã trả kết quả, bấm icon để xem.");
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
        setOpen(true);
        setHasUnreadResult(false);
    };

    return (
        <>
            <div className="fixed bottom-24 right-4 z-50 sm:bottom-6 sm:right-6">
                <div className="mb-2 flex justify-end">
                    <button
                        type="button"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                        className={`inline-flex h-11 w-11 items-center justify-center rounded-full border shadow-lg transition-all ${
                            theme === "dark"
                                ? "border-white/15 bg-white/10 text-white hover:bg-white/15"
                                : "border-gray-200 bg-white text-gray-900 hover:bg-gray-50"
                        }`}
                    >
                        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                </div>
                {open ? (
                    <div className="w-[min(92vw,390px)] max-h-[min(80vh,680px)] overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl">
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-brand-orange" />
                                <h3 className="text-base font-semibold text-gray-900">AI gợi ý món theo cảm giác thèm</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Đóng gợi ý món"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <p className="mb-3 text-sm text-gray-600">Ví dụ: “thèm món cay, có nước, ăn tối nhẹ bụng”.</p>

                        <div className="flex flex-col gap-3">
                            <textarea
                                value={context}
                                onChange={(e) => setContext(e.target.value)}
                                placeholder="Bạn đang thèm kiểu món gì?"
                                className="min-h-[96px] w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-brand-orange"
                            />
                            <button
                                onClick={handleSuggest}
                                className="inline-flex items-center justify-center rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:bg-brand-orange/90"
                            >
                                {loading ? "Đang xử lý (bấm lại để thay prompt)..." : "Gợi ý món ăn"}
                            </button>
                        </div>

                        {suggestion && (
                            <div className="mt-4 max-h-[45vh] overflow-y-auto rounded-lg border border-orange-100 bg-orange-50 p-3 text-sm text-gray-800">
                                <div className="mb-2 flex items-center justify-between gap-2 border-b border-orange-200 pb-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
                                        Gợi ý từ AI
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsZoomed(true)}
                                            className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100"
                                        >
                                            <Expand className="h-3.5 w-3.5" />
                                            Phóng to
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCopySuggestion}
                                            className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-white px-2 py-1 text-xs font-medium text-orange-700 hover:bg-orange-100"
                                        >
                                            <Copy className="h-3.5 w-3.5" />
                                            Copy
                                        </button>
                                    </div>
                                </div>
                                <div className="prose prose-sm max-w-none text-gray-800 prose-headings:my-2 prose-headings:text-gray-900 prose-h1:text-3xl prose-h1:font-semibold prose-h2:text-2xl prose-h2:font-semibold prose-h3:text-xl prose-h3:font-semibold prose-p:my-1.5 prose-p:leading-relaxed prose-li:my-0.5 prose-strong:text-gray-900">
                                    <ReactMarkdown>{suggestion}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={handleOpenPanel}
                        className="relative inline-flex items-center gap-2 rounded-full bg-brand-orange px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-brand-orange/90"
                    >
                        <Sparkles className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
                        {loading ? "AI đang xử lý..." : "AI gợi ý món"}
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
                <div className="fixed inset-0 z-[60] bg-black/45 p-3 sm:p-6" onClick={() => setIsZoomed(false)} aria-hidden="true">
                    <div
                        className="mx-auto flex h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 sm:px-5">
                            <p className="text-sm font-semibold text-gray-900 sm:text-base">Kết quả AI (chế độ đọc)</p>
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
