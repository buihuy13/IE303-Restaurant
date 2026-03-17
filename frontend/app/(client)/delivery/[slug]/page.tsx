import DeliveryStatusPageContainer from "@/components/client/Delivery/DeliveryStatusPageContainer";

// Force dynamic rendering to prevent caching and ensure fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function DeliveryStatusPage({ params }: { params: { slug: string } }) {
        return (
                <section className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-50 to-white">
                        <DeliveryStatusPageContainer params={params} />
                </section>
        );
}
