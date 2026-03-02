import { Search } from "lucide-react";

import { Button, Input } from "@/components/ui";

export function SearchBar() {
  return (
    <div className="hidden max-w-xl flex-1 lg:block">
      <div className="flex overflow-hidden rounded-md border border-stroke shadow-sm focus-within:border-brand-purple">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-grey" />
          <Input
            className="w-full py-2 pl-10 pr-3 text-sm outline-none placeholder:text-brand-grey"
            placeholder="Search restaurants or dishes..."
          />
        </div>
        <Button className="rounded-none px-5" type="button">
          Search
        </Button>
      </div>
    </div>
  );
}

