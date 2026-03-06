import { useCallback, useState } from "react";
import { productApi } from "@/lib/api/productApi";
import { getImageUrl } from "@/lib/utils";

export function extractBaseProductId(productId: string): string {
    const sep = productId.indexOf("--");
    return sep === -1 ? productId : productId.substring(0, sep);
}

export function parseProductIdForImage(productId: string): string | null {
    try {
        const sep = productId.indexOf("--");
        if (sep === -1) return null;
        const encoded = productId.slice(sep + 2)?.trim();
        if (!encoded) return null;
        let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
        const padding = (4 - (base64.length % 4)) % 4;
        base64 += "=".repeat(padding);
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
        if (parsed?.imageURL && typeof parsed.imageURL === "string" && parsed.imageURL.trim()) return parsed.imageURL.trim();
        if (parsed?.imageUrl && typeof parsed.imageUrl === "string" && parsed.imageUrl.trim()) return parsed.imageUrl.trim();
        if (parsed?.image && typeof parsed.image === "string" && parsed.image.trim()) return parsed.image.trim();
    } catch {
        // ignore
    }
    return null;
}

export function useGroupOrderProductImage() {
    const [productImageCache, setProductImageCache] = useState<Map<string, string>>(new Map());

    const fetchAndCacheProductImage = useCallback((baseProductId: string) => {
        if (!baseProductId || !baseProductId.startsWith("PROD")) return;
        productApi.getProductById(baseProductId)
            .then((res) => {
                const url = res.data?.imageURL;
                if (typeof url === "string" && url.trim()) {
                    setProductImageCache((prev) => {
                        const next = new Map(prev);
                        next.set(baseProductId, url.trim());
                        return next;
                    });
                }
            })
            .catch(() => {});
    }, []);

    const getItemImageSource = useCallback(
        (
            item: {
                productId?: string;
                imageURL?: string | null;
                imageUrl?: string | null;
                image?: string | null;
                cartItemImage?: string | null;
            },
        ): string | null => {
            if (item.imageURL && typeof item.imageURL === "string" && item.imageURL.trim()) return item.imageURL.trim();
            if (item.imageUrl && typeof item.imageUrl === "string" && item.imageUrl.trim()) return item.imageUrl.trim();
            if (item.image && typeof item.image === "string" && item.image.trim()) return item.image.trim();
            if (item.cartItemImage && typeof item.cartItemImage === "string" && item.cartItemImage.trim()) return item.cartItemImage.trim();
            if (item.productId) {
                const fromEncoded = parseProductIdForImage(item.productId);
                if (fromEncoded) return fromEncoded;
                const baseId = extractBaseProductId(item.productId);
                const cached = productImageCache.get(baseId);
                if (cached) return cached;
                fetchAndCacheProductImage(baseId);
            }
            return null;
        },
        [productImageCache, fetchAndCacheProductImage],
    );

    const getItemImageUrl = useCallback(
        (item: Parameters<typeof getItemImageSource>[0]) => {
            const src = getItemImageSource(item);
            return src ? getImageUrl(src) : null;
        },
        [getItemImageSource],
    );

    return { productImageCache, getItemImageSource, getItemImageUrl, extractBaseProductId, parseProductIdForImage };
}
