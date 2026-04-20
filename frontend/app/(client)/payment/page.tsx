import PaymentPageContainer from "@/components/client/Payment/PaymentPageContainer";
import GlobalLoader from "@/components/ui/GlobalLoader";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PaymentPage() {
    return (
        <section className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
            <Suspense fallback={<GlobalLoader label="Loading" sublabel="Setting up checkout" />}>
                <PaymentPageContainer />
            </Suspense>
        </section>
    );
}
