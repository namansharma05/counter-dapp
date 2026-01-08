"use client";
import { Connection } from "@solana/web3.js";

import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";
import { useEffect, useState } from "react";

export default function Home() {
    // const programId = new PublicKey(
    //     "5qir8KuyVwFcUpNvf8c6K81a9iUN96MUTkCQdxr23R2h"
    // );

    // const idlWithAddress = { ...idl, address: programId.toBase58() };
    const [mounted, setMounted] = useState(false);
    const wallet = useAnchorWallet();

    useEffect(() => {
        setMounted(true); // ✅ Set after first client render
    }, []);

    if (!mounted) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="h-12 w-48 bg-gray-200 rounded-lg animate-pulse" />
            </div>
        );
    }

    const getProvider = () => {
        if (!wallet) throw new Error("Connect wallet first");

        const connection = new Connection("http://127:0.0.1:8899", "processed");

        const provider = new anchor.AnchorProvider(
            connection,
            wallet,
            anchor.AnchorProvider.defaultOptions()
        );
        return provider;
    };

    const endpoint = "http://127:0.0.1:8899";

    return (
        <div className="flex justify-center items-center h-screen">
            <WalletMultiButton />
        </div>
    );
}
