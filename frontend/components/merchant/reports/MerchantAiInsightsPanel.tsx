"use client";

import { productApi } from "@/lib/api/productApi";
import {
    getRecommendationErrorMessage,
    isRecommendationForbiddenError,
    isRecommendationUnauthorizedError,
    recommendationApi,
} from "@/lib/api/recommendationApi";
import { Copy, Sparkles, ThumbsUp, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

type ProductOption = {
    productId: string;
    productName: string;
};

interface MerchantAiInsightsPanelProps {
    restaurantId: string;
    restaurantName?: string;
}

export default function MerchantAiInsightsPanel({ restaurantId, restaurantName }: MerchantAiInsightsPanelProps) {
    const [reviewType, setReviewType] = useState<"RESTAURANT" | "PRODUCT">("RESTAURANT");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [reviewSummary, setReviewSummary] = useState<string>("");
    const [improvements, setImprovements] = useState<string[]>([]);
    const [reviewProducts, setReviewProducts] = useState<ProductOption[]>([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const canSummarizeProduct = useMemo(
        () => reviewType !== "PRODUCT" || !!selectedProductId,
        [reviewType, selectedProductId],
    );

    useEffect(() => {
        let active = true;
        const fetchProducts = async () => {
            setProductsLoading(true);
            try {
                const response = await productApi.getProductsByRestaurantId(restaurantId);
                if (!active) return;
                const mapped = (Array.isArray(response.data) ? response.data : []).map((product) => ({
                    productId: product.id,
                    productName: product.productName,
                }));
                setReviewProducts(mapped);
            } catch (error) {
                if (active) {
                    console.error("Failed to load products for AI review summary:", error);
                    setReviewProducts([]);
                }
            } finally {
                if (active) setProductsLoading(false);
            }
        };

        fetchProducts();
        return () => {
            active = false;
        };
    }, [restaurantId]);

    const handleSummarizeReviews = async () => {
        if (reviewType === "PRODUCT" && !selectedProductId) {
            toast.error("Chọn món để phân tích review.");
            return;
        }

        setSummaryLoading(true);
        try {
            const result = await recommendationApi.summarizeReviews({
                id: reviewType === "RESTAURANT" ? restaurantId : selectedProductId,
                rvType: reviewType,
            });
            setReviewSummary(result.summary || "");
            setImprovements(Array.isArray(result.improvements) ? result.improvements : []);
        } catch (error) {
            const backendMessage = getRecommendationErrorMessage(error);
            if (isRecommendationUnauthorizedError(error)) {
                toast.error(backendMessage ?? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để phân tích AI.");
                return;
            }
            if (isRecommendationForbiddenError(error)) {
                toast.error(backendMessage ?? "Bạn chưa được backend cấp quyền dùng AI tổng hợp review (403 Forbidden).");
                return;
            }
            console.error("Summarize reviews failed:", error);
            toast.error(backendMessage ?? "Không thể tóm tắt review lúc này.");
        } finally {
            setSummaryLoading(false);
        }
    };

    const extractStrengthsFromSummary = (summary: string): string[] => {
        if (!summary.trim()) return [];
        const parts = summary
            .split(/[\n.]/g)
            .map((item) => item.trim())
            .filter(Boolean);

        const positiveKeywords = [
            "tốt",
            "ngon",
            "hài lòng",
            "nhanh",
            "ổn",
            "tích cực",
            "điểm mạnh",
            "phát huy",
            "chất lượng",
            "giá hợp lý",
        ];

        return parts
            .filter((item) => positiveKeywords.some((keyword) => item.toLowerCase().includes(keyword)))
            .slice(0, 5);
    };

    const strengths = useMemo(() => extractStrengthsFromSummary(reviewSummary), [reviewSummary]);

    const copyText = async (text: string, successMessage: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(successMessage);
        } catch (error) {
            console.error("Copy failed:", error);
            toast.error("Copy thất bại.");
        }
    };

    return (
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-orange" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI tổng hợp đánh giá</h3>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                Xem overview từ review để biết điểm tốt cần phát huy và các điểm cần cải thiện.
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <select
                    title="Chọn phạm vi review"
                    aria-label="Chọn phạm vi review"
                    value={reviewType}
                    onChange={(e) => setReviewType(e.target.value as "RESTAURANT" | "PRODUCT")}
                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-orange dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                    <option value="RESTAURANT">Theo nhà hàng</option>
                    <option value="PRODUCT">Theo món ăn</option>
                </select>

                <select
                    title="Chọn món ăn để phân tích review"
                    aria-label="Chọn món ăn để phân tích review"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={reviewType !== "PRODUCT"}
                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-brand-orange disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                >
                    <option value="">
                        {reviewType === "PRODUCT"
                            ? productsLoading
                                ? "Đang tải danh sách món..."
                                : "Chọn món để phân tích"
                            : restaurantName || "Nhà hàng hiện tại"}
                    </option>
                    {reviewProducts.map((product) => (
                        <option key={product.productId} value={product.productId}>
                            {product.productName}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleSummarizeReviews}
                disabled={summaryLoading || !canSummarizeProduct}
                className="mt-3 rounded-lg bg-brand-orange px-4 py-2 text-sm font-medium text-white hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {summaryLoading ? "Đang phân tích..." : "Phân tích review"}
            </button>

            {(reviewSummary || improvements.length > 0) && (
                <div className="mt-4 space-y-3">
                    {reviewSummary && (
                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Tổng quan</p>
                                <button
                                    type="button"
                                    onClick={() => copyText(reviewSummary, "Đã copy phần tổng quan.")}
                                    className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copy
                                </button>
                            </div>
                            <p className="text-sm text-gray-800 dark:text-gray-100">{reviewSummary}</p>
                        </div>
                    )}
                    {strengths.length > 0 && (
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                <ThumbsUp className="h-4 w-4" />
                                Điểm mạnh cần phát huy
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-800">
                                {strengths.map((item, idx) => (
                                    <li key={`${idx}-${item.slice(0, 20)}`}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {improvements.length > 0 && (
                        <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                            <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold text-red-700">
                                <TriangleAlert className="h-4 w-4" />
                                Điểm cần cải thiện
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-sm text-red-800">
                                {improvements.map((item, idx) => (
                                    <li key={`${idx}-${item.slice(0, 20)}`}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
