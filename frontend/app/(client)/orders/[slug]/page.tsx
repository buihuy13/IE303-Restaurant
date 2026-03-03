import OrderDetailPageShell from "@/components/client/orders/OrderDetailPageShell";

type PageProps = {
  params: { slug: string };
};

export default function OrderDetailPage({ params }: PageProps) {
  return <OrderDetailPageShell slug={params.slug} />;
}
