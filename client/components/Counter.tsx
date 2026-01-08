// components/Counter.tsx
"use client";

import { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

// Replace with your program ID
const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID_HERE");

export const Counter = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    // Fetch counter value
    const fetchCount = async () => {
        if (!publicKey) return;

        try {
            setLoading(true);

            // Derive the PDA for the counter account
            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey.toBuffer()],
                PROGRAM_ID
            );

            // Fetch account data
            const accountInfo = await connection.getAccountInfo(counterPDA);

            if (accountInfo) {
                // Parse the counter value from account data
                // Assuming counter is stored as a u64 (8 bytes)
                const data = accountInfo.data;
                const value = new anchor.BN(data.slice(0, 8), "le").toNumber();
                setCount(value);
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
        if (!publicKey) return;

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey.toBuffer()],
                PROGRAM_ID
            );

            // Create instruction to initialize counter
            // You'll need to replace this with your actual program instruction
            const instruction = {
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: counterPDA, isSigner: false, isWritable: true },
                    {
                        pubkey: SystemProgram.programId,
                        isSigner: false,
                        isWritable: false,
                    },
                ],
                programId: PROGRAM_ID,
                data: Buffer.from([0]), // Initialize instruction discriminator
            };

            const transaction = new Transaction().add(instruction);

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");

            await fetchCount();
            alert("Counter initialized!");
        } catch (error) {
            console.error("Error initializing:", error);
            alert("Failed to initialize counter");
        } finally {
            setLoading(false);
        }
    };

    // Increment counter
    const increment = async () => {
        if (!publicKey) return;

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey.toBuffer()],
                PROGRAM_ID
            );

            // Create increment instruction
            const instruction = {
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: false },
                    { pubkey: counterPDA, isSigner: false, isWritable: true },
                ],
                programId: PROGRAM_ID,
                data: Buffer.from([1]), // Increment instruction discriminator
            };

            const transaction = new Transaction().add(instruction);

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");

            await fetchCount();
        } catch (error) {
            console.error("Error incrementing:", error);
            alert("Failed to increment counter");
        } finally {
            setLoading(false);
        }
    };

    // Decrement counter
    const decrement = async () => {
        if (!publicKey) return;

        try {
            setLoading(true);

            const [counterPDA] = PublicKey.findProgramAddressSync(
                [Buffer.from("counter"), publicKey.toBuffer()],
                PROGRAM_ID
            );

            const instruction = {
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: false },
                    { pubkey: counterPDA, isSigner: false, isWritable: true },
                ],
                programId: PROGRAM_ID,
                data: Buffer.from([2]), // Decrement instruction discriminator
            };

            const transaction = new Transaction().add(instruction);

            const signature = await sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature, "confirmed");

            await fetchCount();
        } catch (error) {
            console.error("Error decrementing:", error);
            alert("Failed to decrement counter");
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
                onClick={fetchCount}
                disabled={loading}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
            >
                Refresh
            </button>
        </div>
    );
};
