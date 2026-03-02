import { FooterBottom, FooterTop, TrustSection } from "@/components/layout/footer";
;
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stroke bg-gray-50">
      <div className="custom-container mx-auto px-4 py-12">
        <FooterTop />
        <TrustSection />
        <FooterBottom year={year} />
      </div>
    </footer>
  );
}

