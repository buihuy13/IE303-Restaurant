import { GroupOrderUnavailable } from "@/components/client/group-orders/GroupOrderUnavailable";

export default function GroupOrderPage() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white py-12">
            <div className="custom-container max-w-lg mx-auto">
                <GroupOrderUnavailable />
            </div>
        </main>
    );
}
