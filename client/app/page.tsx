"use client";
import { Connection } from "@solana/web3.js";

import * as anchor from "@coral-xyz/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

import "@solana/wallet-adapter-react-ui/styles.css";

export default function Home() {
    // const programId = new PublicKey(
    //     "5qir8KuyVwFcUpNvf8c6K81a9iUN96MUTkCQdxr23R2h"
    // );

    // const idlWithAddress = { ...idl, address: programId.toBase58() };

    const wallet = useAnchorWallet();

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
