import { AuthButtons, CartButton, CategoryNav, LocationSelector, Logo, PromoBar, SearchBar } from "@/components/layout/header";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-white shadow-sm">
      <div className="custom-container mx-auto px-4">
        <div className="flex min-h-20 items-center gap-6">
          <Logo />
          <LocationSelector />
          <SearchBar />
          <div className="ml-auto flex items-center gap-2">
            <CartButton />
            <AuthButtons />
          </div>
        </div>
      </div>  

      <PromoBar />
      <CategoryNav />
    </header>
  );
}

