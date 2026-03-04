import { faqItems } from "@/constants";

export function useFaqPage() {
  const items = faqItems;
  const title =
    "Most asked questions by our beloved customers";
  return { title, items };
}
