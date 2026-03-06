import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import ChatPageClient from "@/components/client/Chat/ChatPageClient";

export default function ChatPage() {
    return (
        <Suspense
            fallback={
                <div className="custom-container py-8 flex items-center justify-center h-[600px]">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            }
        >
            <ChatPageClient />
        </Suspense>
    );
}

