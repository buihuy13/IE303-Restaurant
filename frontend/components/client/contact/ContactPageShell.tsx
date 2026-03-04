"use client";

import ContactForm from "./ContactForm";
import ContactHero from "./ContactHero";

/** Chỉ compose layout + ContactHero + ContactForm */
export default function ContactPageShell() {
  return (
    <main className="bg-brand-white">
      <section className="px-4 py-16">
        <div className="custom-container">
          <ContactHero />
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
