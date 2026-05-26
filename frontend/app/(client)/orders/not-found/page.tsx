import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function OrderNotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white flex items-center justify-center p-6">
            <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-center">
                <div className="text-5xl mb-3">🧾</div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">Order not found</h1>
                <p className="text-sm text-gray-600">
                    We could not find that order. Please check the link or view your order history.
                </p>
                <div className="mt-6 flex flex-wrap justify-center gap-2">
                    <Link href="/orders">
                        <Button type="button" variant="brand" className="rounded-full">
                            View orders
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
