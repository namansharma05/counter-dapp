// app/page.tsx
"use client";

import dynamic from "next/dynamic";

// Dynamically import WalletButton with no SSR to prevent hydration errors
const WalletButton = dynamic(
  () => import("@/components/WalletButton").then((mod) => mod.WalletButton),
  { ssr: false },
);

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 md:p-24">
      <h1 className="text-3xl md:text-5xl font-bold mb-8 text-center px-4">
        Solana Counter dApp
      </h1>
      <WalletButton />
    </main>
  );
}
