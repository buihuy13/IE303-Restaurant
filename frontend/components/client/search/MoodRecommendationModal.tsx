"use client";

import { Button } from "@/components/ui/Button";
import * as Dialog from "@radix-ui/react-dialog";
import { Loader2, X } from "lucide-react";

interface MoodRecommendationModalProps {
    open: boolean;
    moods: string[];
    loading: boolean;
    submitting: boolean;
    selectedMood: string | null;
    errorMessage: string | null;
    onClose: () => void;
    onSelectMood: (mood: string) => void | Promise<void>;
}

export function MoodRecommendationModal({
    open,
    moods,
    loading,
    submitting,
    selectedMood,
    errorMessage,
    onClose,
    onSelectMood,
}: MoodRecommendationModalProps) {
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen && !submitting) {
            onClose();
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={handleOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-[120] bg-black/45" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-[121] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-gray-200 bg-white p-5 shadow-2xl outline-none md:p-6">
                <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                        <Dialog.Title className="text-xl font-bold tracking-tight text-gray-900">Bạn đang muốn ăn theo tâm trạng nào?</Dialog.Title>
                        <Dialog.Description className="mt-1 text-sm text-gray-600">
                            Chọn 1 tâm trạng để nhận gợi ý món ăn. Bạn có thể bỏ qua.
                        </Dialog.Description>
                    </div>
                    <Dialog.Close asChild>
                        <button
                            type="button"
                            disabled={submitting}
                            className="rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Close"
                            aria-label="Close mood picker"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </Dialog.Close>
                </div>

                {loading ? (
                    <div className="py-10 text-center text-sm text-gray-600">Đang tải danh sách tâm trạng...</div>
                ) : moods.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-600">
                        Không tải được danh sách tâm trạng lúc này.
                    </div>
                ) : (
                    <div className="flex flex-wrap gap-2.5">
                        {moods.map((mood) => {
                            const isActive = selectedMood === mood;
                            return (
                                <Button
                                    key={mood}
                                    type="button"
                                    onClick={() => onSelectMood(mood)}
                                    disabled={submitting}
                                    variant={isActive ? "brand" : "secondary"}
                                    size="sm"
                                    className="rounded-full"
                                >
                                    {mood}
                                </Button>
                            );
                        })}
                    </div>
                )}

                {errorMessage && (
                    <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                        {errorMessage}
                    </p>
                )}

                {submitting && (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-brand-orange/25 bg-brand-orange/5 px-3 py-2 text-sm text-brand-orange">
                        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                        <span>
                            Đang lấy gợi ý món ăn
                            {selectedMood ? ` cho tâm trạng "${selectedMood}"` : ""}...
                        </span>
                    </div>
                )}

                <div className="mt-5 flex justify-end">
                    <Button type="button" variant="brandOutline" onClick={onClose} disabled={submitting}>
                        Bỏ qua
                    </Button>
                </div>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
