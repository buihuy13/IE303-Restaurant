import { MessageCircle } from "lucide-react";

export function AdminMessagesHeader() {
    return (
        <div className="flex items-start justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Support conversations across the platform
                </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                <MessageCircle className="h-4 w-4 text-brand-yellow" />
                <span className="font-medium">Admin Inbox</span>
            </div>
        </div>
    );
}
