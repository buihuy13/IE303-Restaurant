import { Button } from "@/components/ui";

type CategoryItemProps = {
  name: string;
  icon: string;
};

export function CategoryItem({ name, icon }: CategoryItemProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      className="group flex min-w-[90px] snap-start cursor-pointer flex-col items-center gap-3 bg-transparent p-0 hover:bg-transparent"
    >
      <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-3xl shadow-sm transition-all duration-300 group-hover:scale-105 group-hover:bg-brand-purplelight">
        <span>{icon}</span>
      </div>
      <span className="whitespace-nowrap text-center text-sm font-semibold text-brand-black transition-colors group-hover:text-brand-purple">
        {name}
      </span>
    </Button>
  );
}

