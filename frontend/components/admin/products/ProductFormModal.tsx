"use client";

import type { Category, Product, ProductCreateData, Restaurant, Size } from "@/types";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ProductFormModalProps {
    product: Product | null;
    categories: Category[];
    sizes: Size[];
    restaurants: Restaurant[];
    onSave: (productData: ProductCreateData, imageFile?: File) => Promise<void>;
    onClose: () => void;
}

export default function ProductFormModal({
    product,
    categories,
    sizes,
    restaurants,
    onSave,
    onClose,
}: ProductFormModalProps) {
    const [formData, setFormData] = useState<ProductCreateData>({
        productName: "",
        description: "",
        categoryId: "",
        restaurantId: "",
        available: true,
        sizeIds: [],
    });
    const [imageFile, setImageFile] = useState<File | undefined>();
    const [imagePreview, setImagePreview] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState<{ sizeId: string; price: number }[]>([]);
    const titleId = "product-form-modal-title";

    useEffect(() => {
        if (product) {
            setFormData({
                productName: product.productName,
                description: product.description,
                categoryId: product.categoryId,
                restaurantId: product.restaurant?.id || "",
                available: product.available,
                sizeIds: product.productSizes.map((ps: { sizeId: string; price: number }) => ({
                    sizeId: ps.sizeId,
                    price: ps.price,
                })),
            });
            setSelectedSizes(
                product.productSizes.map((ps: { sizeId: string; price: number }) => ({
                    sizeId: ps.sizeId,
                    price: ps.price,
                })),
            );
            if (product.imageURL) {
                setImagePreview(product.imageURL as string);
            }
        }
    }, [product]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSizeToggle = (sizeId: string) => {
        const exists = selectedSizes.find((s) => s.sizeId === sizeId);
        if (exists) {
            setSelectedSizes(selectedSizes.filter((s) => s.sizeId !== sizeId));
        } else {
            setSelectedSizes([...selectedSizes, { sizeId, price: 0 }]);
        }
    };

    const handleSizePrice = (sizeId: string, price: number) => {
        setSelectedSizes(selectedSizes.map((s) => (s.sizeId === sizeId ? { ...s, price } : s)));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave({ ...formData, sizeIds: selectedSizes }, imageFile);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-[2px]" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] max-h-[90vh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg bg-white outline-none">
                <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                    <Dialog.Title id={titleId} className="text-2xl font-bold">{product ? "Edit Product" : "Create Product"}</Dialog.Title>
                    <Dialog.Close asChild>
                        <button type="button" className="text-gray-500 hover:text-gray-700" aria-label="Close product form">
                            <X className="w-6 h-6" />
                        </button>
                    </Dialog.Close>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label htmlFor="productName" className="block text-sm font-medium mb-1">Product Name *</label>
                        <input
                            id="productName"
                            name="productName"
                            type="text"
                            required
                            spellCheck={false}
                            value={formData.productName}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    productName: e.target.value,
                                })
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>

                    <div>
                        <label htmlFor="productDescription" className="block text-sm font-medium mb-1">Description *</label>
                        <textarea
                            id="productDescription"
                            name="description"
                            required
                            spellCheck={false}
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                            rows={3}
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="productCategory" className="block text-sm font-medium mb-1">Category *</label>
                            <select
                                id="productCategory"
                                name="categoryId"
                                required
                                value={formData.categoryId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        categoryId: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                            >
                                <option value="">Select category</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.cateName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label htmlFor="productRestaurant" className="block text-sm font-medium mb-1">Restaurant *</label>
                            <select
                                id="productRestaurant"
                                name="restaurantId"
                                required
                                value={formData.restaurantId}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        restaurantId: e.target.value,
                                    })
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-purple"
                            >
                                <option value="">Select restaurant</option>
                                {restaurants.map((rest) => (
                                    <option key={rest.id} value={rest.id}>
                                        {rest.resName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Sizes & Prices *</label>
                        <div className="space-y-2">
                            {sizes.map((size) => {
                                const selectedSize = selectedSizes.find((s) => s.sizeId === size.id);
                                const isSelected = !!selectedSize;
                                const checkboxId = `product-size-${size.id}`;
                                const priceId = `product-size-price-${size.id}`;

                                return (
                                    <div key={size.id} className="flex items-center gap-3 p-3 border rounded-lg">
                                        <input
                                            id={checkboxId}
                                            name="sizeIds"
                                            type="checkbox"
                                            value={size.id}
                                            checked={isSelected}
                                            onChange={() => handleSizeToggle(size.id)}
                                            className="w-4 h-4"
                                        />
                                        <label htmlFor={checkboxId} className="font-medium flex-1">{size.name}</label>
                                        {isSelected && (
                                            <input
                                                id={priceId}
                                                name={`price-${size.id}`}
                                                type="number"
                                                aria-label={`Price for ${size.name}`}
                                                required
                                                min="0"
                                                step="0.01"
                                                value={selectedSize.price}
                                                onChange={(e) => handleSizePrice(size.id, Number(e.target.value))}
                                                placeholder="Price"
                                                className="w-32 border rounded px-2 py-1"
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2">
                            <input
                                name="available"
                                type="checkbox"
                                checked={formData.available}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        available: e.target.checked,
                                    })
                                }
                                className="w-4 h-4"
                            />
                            <span className="text-sm font-medium">Available</span>
                        </label>
                    </div>

                    <div>
                        <label htmlFor="productImage" className="block text-sm font-medium mb-1">Product Image</label>
                        <input
                            id="productImage"
                            name="productImage"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full border rounded-lg px-3 py-2"
                        />
                        {imagePreview && imagePreview.trim() !== "" && (
                            <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden">
                                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || selectedSizes.length === 0}
                            className="px-4 py-2 bg-brand-purple text-white rounded-lg hover:bg-brand-purple/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
