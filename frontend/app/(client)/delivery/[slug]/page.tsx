import DeliveryTrackingPageShell from "@/components/client/delivery/DeliveryTrackingPageShell";

type PageProps = {
  params: { slug: string };
};

export default function DeliveryTrackingPage({ params }: PageProps) {
  return <DeliveryTrackingPageShell slug={params.slug} />;
}
