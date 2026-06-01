import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ChatPageClient from "@/components/client/chat/ChatPageClient";

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                    <div className="custom-container py-8 flex items-center justify-center h-[600px]">
                        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin text-brand-orange" />
                            <span className="text-sm font-semibold text-gray-800">Loading chat...</span>
                        </div>
                    </div>
                </div>
            }
        >
            <ChatPageClient />
        </Suspense>
    );
}

