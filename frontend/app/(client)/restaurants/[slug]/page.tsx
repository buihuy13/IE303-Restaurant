import RestaurantDetailPageShell from "@/components/client/restaurants/RestaurantDetailPageShell";

type PageProps = {
  params: { slug: string };
};

export default function RestaurantDetailPage({ params }: PageProps) {
  return <RestaurantDetailPageShell slug={params.slug} />;
}
