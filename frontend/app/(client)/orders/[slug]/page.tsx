import OrderDetailPageContainer from "@/components/client/OrderDetail/OrderDetailContainer";

export default function OrderDetailPage({ params }: { params: { slug: string } }) {
        return (
                <section className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                        <OrderDetailPageContainer params={params} />
                </section>
        );
}
