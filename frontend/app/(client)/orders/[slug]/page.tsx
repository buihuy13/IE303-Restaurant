import OrderDetailPageContainer from "@/components/client/OrderDetail/OrderDetailContainer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function OrderDetailPage() {
        return (
                <section className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                        <OrderDetailPageContainer />
                </section>
        );
}
