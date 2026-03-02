import { Search } from "lucide-react";

import { Button, Input } from "@/components/ui";

export function HeroSearch() {
  return (
    <div className="w-full max-w-3xl">
      <div className="flex items-center gap-2 rounded-full bg-white p-2 shadow-xl">
        <Search className="ml-3 h-5 w-5 text-gray-400" />
        <Input
          className="flex-1 border-none bg-transparent px-4 text-lg outline-none placeholder:text-gray-400"
          placeholder="Search dishes, restaurants, or locations..."
        />
        <Button className="rounded-full bg-brand-orange px-8 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition-colors">
          Search
        </Button>
      </div>
    </div>
  );
}

