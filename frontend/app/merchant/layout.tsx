import { MerchantLayoutClient } from "@/components/merchant/MerchantLayoutClient";

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MerchantLayoutClient>{children}</MerchantLayoutClient>;
}
