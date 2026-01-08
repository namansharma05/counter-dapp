// components/WalletButton.tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

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
        <div className="flex flex-col items-center gap-4">
            <WalletMultiButton />

            {connected && publicKey && (
                <div className="text-sm">
                    <p className="font-semibold">Connected!</p>
                    <p className="text-gray-600">
                        Wallet: {publicKey.toBase58().slice(0, 4)}...
                        {publicKey.toBase58().slice(-4)}
                    </p>
                </div>
            )}
        </div>
    );
};

// Custom button with better error handling
export const CustomWalletButton = () => {
    const {
        select,
        wallets,
        publicKey,
        disconnect,
        connect,
        connecting,
        wallet,
    } = useWallet();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleConnect = async (walletAdapter: any) => {
        try {
            // Select the wallet using its name property
            select(walletAdapter.adapter.name);

            // Small delay to ensure wallet is selected
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Then try to connect
            await connect();
        } catch (error: any) {
            console.error("Connection error:", error);

            // User-friendly error messages
            if (error.message?.includes("User rejected")) {
                alert("You rejected the connection request");
            } else if (error.message?.includes("wallet is not installed")) {
                alert(
                    `Please install ${walletAdapter.adapter.name} wallet extension first`
                );
            } else {
                alert(
                    "Failed to connect. Make sure your wallet extension is installed and unlocked."
                );
            }
        }
    };

    if (!mounted) {
        return <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />;
    }

    return (
        <div className="flex flex-col gap-2">
            {!publicKey ? (
                <>
                    <p className="text-sm text-gray-600 mb-2">
                        Choose a wallet to connect:
                    </p>
                    {wallets.filter((w) => w.readyState === "Installed")
                        .length === 0 && (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded mb-2">
                            <p className="text-sm text-yellow-800">
                                No wallet detected. Please install:
                            </p>
                            <ul className="mt-2 text-sm text-yellow-700">
                                <li>
                                    •{" "}
                                    <a
                                        href="https://phantom.app/"
                                        target="_blank"
                                        className="underline"
                                    >
                                        Phantom
                                    </a>
                                </li>
                                <li>
                                    •{" "}
                                    <a
                                        href="https://solflare.com/"
                                        target="_blank"
                                        className="underline"
                                    >
                                        Solflare
                                    </a>
                                </li>
                            </ul>
                        </div>
                    )}

                    {wallets.map((walletItem) => (
                        <button
                            key={walletItem.adapter.name}
                            onClick={() => handleConnect(walletItem)}
                            disabled={
                                connecting ||
                                walletItem.readyState !== "Installed"
                            }
                            className={`px-4 py-2 rounded flex items-center gap-2 ${
                                walletItem.readyState === "Installed"
                                    ? "bg-purple-600 text-white hover:bg-purple-700"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            } disabled:opacity-50`}
                        >
                            {walletItem.adapter.icon && (
                                <img
                                    src={walletItem.adapter.icon}
                                    alt=""
                                    className="w-5 h-5"
                                />
                            )}
                            {connecting &&
                            wallet?.adapter.name === walletItem.adapter.name
                                ? "Connecting..."
                                : walletItem.readyState === "Installed"
                                ? `Connect ${walletItem.adapter.name}`
                                : `${walletItem.adapter.name} (Not Installed)`}
                        </button>
                    ))}
                </>
            ) : (
                <div className="p-4 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-semibold text-green-800 mb-2">
                        Connected!
                    </p>
                    <p className="text-xs text-green-700 mb-3 break-all">
                        {publicKey.toBase58()}
                    </p>
                    <button
                        onClick={disconnect}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full"
                    >
                        Disconnect
                    </button>
                </div>
            )}
        </div>
    );
};
