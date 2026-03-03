import AboutHero from "@/components/client/about/AboutHero";
import ContentSection from "@/components/client/about/ContentSection";
import StatsBanner from "@/components/client/about/StatsBanner";
import ScrollReveal from "@/components/client/animations/ScrollReveal";
import HomePageReviews from "@/components/client/home/HomePageReviews";
import NewsLetter from "@/components/client/home/NewsLetter";
import { useAboutPage } from "@/hooks/about/useAboutPage";

export default function AboutPage() {
  const { sections } = useAboutPage();

  return (
    <main>
      <ScrollReveal className="bg-brand-yellowlight">
        <AboutHero />
      </ScrollReveal>

      {sections.map((section, index) => (
        <ScrollReveal key={section.id} delay={index === 0 ? 0.1 : 0.2}>
          <ContentSection
            image={section.image}
            title={section.title}
            reverse={section.reverse}
          >
            {section.paragraphs.map((p) => (
              <p key={p} className="mt-4 text-brand-grey">
                {p}
              </p>
            ))}
          </ContentSection>
        </ScrollReveal>
      ))}

      <ScrollReveal delay={0.1}>
        <StatsBanner />
      </ScrollReveal>

      <ScrollReveal>
        <HomePageReviews />
        <NewsLetter />
      </ScrollReveal>
    </main>
  );
}
