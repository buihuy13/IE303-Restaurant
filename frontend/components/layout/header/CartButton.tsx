import { ShoppingCart } from "lucide-react";

import { Badge, Button } from "@/components/ui";

export function CartButton() {
  return (
    <Button aria-label="Cart" className="relative gap-2 px-3" variant="ghost">
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden sm:inline">Cart</span>
      <Badge className="absolute -right-2 -top-2 rounded-full bg-brand-orange px-1.5 text-xs text-white">
        3
      </Badge>
    </Button>
  );
}

