import type { ReactNode } from "react";

import { Footer, Header } from "@/components";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
