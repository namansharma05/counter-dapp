// components/Counter.tsx
"use client";

import { useState, useEffect } from "react";
import {
    useAnchorWallet,
    useConnection,
    useWallet,
} from "@solana/wallet-adapter-react";
import {
    PublicKey,
    Transaction,
    SystemProgram,
    Connection,
} from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import idl from "../app/idl/counter.json";

// Replace with your program ID
const PROGRAM_ID = new PublicKey(
    "5qir8KuyVwFcUpNvf8c6K81a9iUN96MUTkCQdxr23R2h"
);

export const Counter = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    const wallet = useAnchorWallet();

    const getProvider = () => {
        if (!wallet) return null;

        const network = "http://127.0.0.1:8899";
        const connection = new Connection(network, "processed");

        const provider = new anchor.AnchorProvider(
            connection,
            wallet,
            anchor.AnchorProvider.defaultOptions()
        );
        return provider;
    };

    // Fetch counter value
    const fetchCount = async () => {
        const provider = getProvider();
        if (!provider) throw "Provider is null";

        const program = new anchor.Program(idl, provider);

        try {
            setLoading(true);

            // Derive the PDA for the counter account
            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey!.toBuffer()],
                PROGRAM_ID
            );

            // Fetch account data
            const counterAccountData = await program.account.counter.fetch(
                counterPDA
            );

            if (counterAccountData) {
                const data = counterAccountData.count;
                setCount(data);
            } else {
                setCount(0);
            }
        } catch (error) {
            console.error("Error fetching count:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initialize counter
    const initialize = async () => {
        const provider = getProvider();
        if (!provider) throw "Provider is null";

        const program = new anchor.Program(idl, provider);

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey!.toBuffer()],
                PROGRAM_ID
            );

            await program.methods
                .initializeCounter()
                .accounts({
                    authority: publicKey!,
                    counterAccount: counterPDA,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            const counterAccountData = await program.account.counter.fetch(
                counterPDA
            );

            await fetchCount();
            alert("Counter initialized!");
        } catch (error) {
            // console.error("Error initializing:", error);
            alert("Failed to initialize counter, already initialized");
        } finally {
            setLoading(false);
        }
    };

    // Increment counter
    const increment = async () => {
        const provider = getProvider();
        if (!provider) throw "Provider is null";

        const program = new anchor.Program(idl, provider);

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey!.toBuffer()],
                PROGRAM_ID
            );

            await program.methods
                .incrementCounter()
                .accounts({
                    authority: publicKey!,
                    counterAccount: counterPDA,
                })
                .rpc();

            const counterAccountData = await program.account.counter.fetch(
                counterPDA
            );
            console.log("count value: ", counterAccountData.count);

            await fetchCount();
        } catch (error) {
            // console.error("Error incrementing:", error);
            alert("Failed to increment counter");
        } finally {
            setLoading(false);
        }
    };

    // Decrement counter
    const decrement = async () => {
        const provider = getProvider();
        if (!provider) throw "Provider is null";

        const program = new anchor.Program(idl, provider);

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey!.toBuffer()],
                PROGRAM_ID
            );

            await program.methods
                .decrementCounter()
                .accounts({
                    authority: publicKey!,
                    counterAccount: counterPDA,
                })
                .rpc();

            const counterAccountData = await program.account.counter.fetch(
                counterPDA
            );
            console.log("count value: ", counterAccountData.count);

            await fetchCount();
        } catch (error) {
            // console.error("Error decrementing:", error);
            alert("Failed to decrement counter");
        } finally {
            setLoading(false);
        }
    };

    // close counter
    const close = async () => {
        const provider = getProvider();
        if (!provider) throw "Provider is null";

        const program = new anchor.Program(idl, provider);

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey!.toBuffer()],
                PROGRAM_ID
            );

            await program.methods
                .closeCounter()
                .accounts({
                    authority: publicKey!,
                    counterAccount: counterPDA,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            setCount(0);
            alert("Counter closed!");
        } catch (error) {
            // console.error("Error closing:", error);
            alert("Failed to close counter");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (publicKey) {
            fetchCount();
        }
    }, [publicKey]);

    if (!publicKey) {
        return (
            <p className="text-gray-600">
                Connect your wallet to use the counter
            </p>
        );
    }

    return (
        <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold">Counter</h2>

            <div className="text-6xl font-bold text-purple-600">
                {loading ? "..." : count}
            </div>

            <div className="flex gap-4">
                <button
                    onClick={decrement}
                    disabled={loading}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    -
                </button>

                <button
                    onClick={increment}
                    disabled={loading}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    +
                </button>
            </div>

            <button
                onClick={initialize}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                Initialize Counter
            </button>

            <button
                onClick={close}
                disabled={loading}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
                Close Counter
            </button>

            <button
                onClick={fetchCount}
                disabled={loading}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
                Refresh
            </button>
        </div>
    );
};
