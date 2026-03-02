import { Button } from "@/components/ui";

const SUGGEST_TAGS = ["Milk tea", "Broken rice", "Fish noodle soup", "Snacks", "Pizza", "Fried chicken"];

export function HeroSuggests() {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {SUGGEST_TAGS.map((tag) => (
        <Button
          key={tag}
          type="button"
          className="rounded-full border border-white/10 bg-white/20 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/30"
          variant="ghost"
        >
          {tag}
        </Button>
      ))}
    </div>
  );
}

