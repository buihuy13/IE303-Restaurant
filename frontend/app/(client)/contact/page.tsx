import ContactForm from "@/components/client/contact/ContactForm";
import ContactHero from "@/components/client/contact/ContactHero";

export default function ContactPage() {
  return (
    <main className="bg-brand-white">
      <section className="py-16 px-4">
        <div className="custom-container">
          <ContactHero />
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
