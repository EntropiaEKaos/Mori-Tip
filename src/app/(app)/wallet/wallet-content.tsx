"use client";

import { Suspense } from "react";
import WalletPage from "./wallet-content";

export default function Page() {
  return (
    <Suspense fallback={<p className="p-4 text-sm text-[#8a826a]">Carregando carteira...</p>}>
      <WalletPage />
    </Suspense>
  );
}
