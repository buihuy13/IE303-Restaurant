import { Apple, Facebook, Instagram, Mail, MapPin, Phone, Youtube } from "lucide-react";

import { Button } from "@/components/ui";
import { FooterColumn } from "./FooterColumn";

const companyLinks = [
  "About Us",
  "Terms of Service",
  "Privacy Policy",
  "Complaint Resolution",
];

const partnerLinks = ["Register as Merchant", "Register as Rider", "Operating Regulations"];

export function FooterTop() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-4">
        <p className="text-2xl font-bold text-brand-purple">E-Food</p>
        <p className="text-sm text-brand-grey">
          Fast delivery from your favorite restaurants in minutes.
        </p>
        <div className="space-y-2 text-sm text-brand-grey">
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            KTX Area A, Di An, Binh Duong
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            1900 xxxx
          </p>
          <p className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            support@efood.vn
          </p>
        </div>
      </div>

      <FooterColumn items={companyLinks} title="About E-Food" />
      <FooterColumn items={partnerLinks} title="Partnership" />

      <div className="space-y-4">
        <h3 className="text-base font-semibold text-brand-black">Get the App</h3>
        <div className="space-y-3">
          <Button
            className="flex items-center gap-2 rounded-md bg-brand-black px-4 py-2 text-sm text-white"
            type="button"
          >
            <Apple className="h-4 w-4" />
            App Store
          </Button>
          <Button
            className="flex items-center gap-2 rounded-md bg-brand-black px-4 py-2 text-sm text-white"
            type="button"
          >
            <Youtube className="h-4 w-4" />
            Google Play
          </Button>
        </div>
        <div className="pt-2">
          <p className="mb-2 text-sm font-medium text-brand-black">Follow us</p>
          <div className="flex items-center gap-4 text-brand-grey">
            <a
              aria-label="Facebook"
              className="transition-colors hover:text-brand-purple"
              href="https://facebook.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              aria-label="Instagram"
              className="transition-colors hover:text-brand-purple"
              href="https://instagram.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              aria-label="YouTube"
              className="transition-colors hover:text-brand-purple"
              href="https://youtube.com"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

