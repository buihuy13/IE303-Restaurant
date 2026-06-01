import { redirect } from "next/navigation";

export default function RestaurantsPage() {
    redirect("/search?type=restaurants");
}

