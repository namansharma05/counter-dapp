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
const programId = process.env.NEXT_PUBLIC_PROGRAM_ID;

if (!programId) {
  throw new Error("NEXT_PUBLIC_PROGRAM_ID is not defined");
}

const PROGRAM_ID = new PublicKey(programId);

export const Counter = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const wallet = useAnchorWallet();

  const getProvider = () => {
    if (!wallet) return null;

    const network = "https://api.devnet.solana.com";
    const connection = new Connection(network, "processed");

    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      anchor.AnchorProvider.defaultOptions(),
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
        PROGRAM_ID,
      );

      // Fetch account data
      const counterAccountData =
        await program.account.counter.fetch(counterPDA);

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
        PROGRAM_ID,
      );

      await program.methods
        .initializeCounter()
        .accounts({
          authority: publicKey!,
          counterAccount: counterPDA,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      const counterAccountData =
        await program.account.counter.fetch(counterPDA);

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
        PROGRAM_ID,
      );

      await program.methods
        .incrementCounter()
        .accounts({
          authority: publicKey!,
          counterAccount: counterPDA,
        })
        .rpc();

      const counterAccountData =
        await program.account.counter.fetch(counterPDA);
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
        PROGRAM_ID,
      );

      await program.methods
        .decrementCounter()
        .accounts({
          authority: publicKey!,
          counterAccount: counterPDA,
        })
        .rpc();

      const counterAccountData =
        await program.account.counter.fetch(counterPDA);
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
        PROGRAM_ID,
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

  // useEffect(() => {
  //     if (publicKey) {
  //         fetchCount();
  //     }
  // }, [publicKey]);

  if (!publicKey) {
    return (
      <p className="text-gray-600">Connect your wallet to use the counter</p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 sm:p-8 bg-white rounded-lg shadow-lg w-full max-w-sm sm:max-w-md mx-auto">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Counter</h2>

      <div className="text-5xl sm:text-7xl font-bold text-purple-600 transition-all duration-300">
        {loading ? "..." : count}
      </div>

      <div className="flex gap-4 w-full justify-center">
        <button
          onClick={decrement}
          disabled={loading}
          className="flex-1 max-w-[100px] px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-xl font-bold"
        >
          -
        </button>

        <button
          onClick={increment}
          disabled={loading}
          className="flex-1 max-w-[100px] px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed text-xl font-bold"
        >
          +
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full mt-4">
        <button
          onClick={initialize}
          disabled={loading}
          className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-transform disabled:opacity-50 font-semibold"
        >
          Initialize Counter
        </button>

        <button
          onClick={close}
          disabled={loading}
          className="w-full px-4 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 active:scale-95 transition-transform disabled:opacity-50 font-semibold"
        >
          Close Counter
        </button>

        <button
          onClick={fetchCount}
          disabled={loading}
          className="w-full px-4 py-2 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 active:scale-95 transition-transform disabled:opacity-50 font-medium"
        >
          Refresh
        </button>
      </div>
    </div>
  );
};
