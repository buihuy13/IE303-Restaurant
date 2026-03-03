import FoodDetailPageShell from "@/components/client/food/FoodDetailPageShell";

type PageProps = {
  params: { slug: string };
};

export default function FoodDetailPage({ params }: PageProps) {
  return <FoodDetailPageShell slug={params.slug} />;
}
