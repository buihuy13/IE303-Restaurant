import { HeroSearch } from "./HeroSearch";
import { HeroSuggests } from "./HeroSuggests";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden bg-brand-purple">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
      <div className="relative z-10 mx-auto flex min-h-[500px] max-w-6xl flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
          Hungry? Order now!
        </h1>
        <p className="mb-10 text-lg text-brand-purplelight md:text-xl">
          Lightning-fast delivery, steaming hot right to your door.
        </p>

        <HeroSearch />
        <HeroSuggests />
      </div>
    </section>
  );
}

