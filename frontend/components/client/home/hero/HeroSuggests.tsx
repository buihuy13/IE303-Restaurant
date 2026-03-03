import { Button } from "@/components/ui";

type HeroSuggestsProps = {
  tags: string[];
};

export function HeroSuggests({ tags }: HeroSuggestsProps) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
      {tags.map((tag) => (
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

