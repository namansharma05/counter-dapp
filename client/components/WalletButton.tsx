// components/WalletButton.tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { Counter } from "./Counter";

export const WalletButton = () => {
  const { publicKey, connected } = useWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent hydration mismatch by not rendering until client-side
  if (!mounted) {
    return <div className="h-12 w-40 bg-gray-200 animate-pulse rounded" />;
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm px-4">
      <div className="flex justify-center w-full">
        <WalletMultiButton />
      </div>

      {connected && publicKey && (
        <div className="text-center w-full space-y-4">
          <div className="bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold inline-block border border-green-100 uppercase tracking-wider">
            Connected
          </div>
          <p className="text-gray-500 text-xs font-mono break-all opacity-70">
            {publicKey.toBase58()}
          </p>
          <Counter />
        </div>
      )}
    </div>
  );
};
