import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { Keypair, PublicKey } from "@solana/web3.js";

describe("counter", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.counter as Program<Counter>;

  const adminWallet = (provider.wallet as NodeWallet).payer;
  
  let counterAccountPda: anchor.web3.PublicKey;
  const findPda = (programId: anchor.web3.PublicKey, seeds: (Buffer | Uint8Array)[]): anchor.web3.PublicKey => {
    const [pda, bump] = anchor.web3.PublicKey.findProgramAddressSync(seeds, programId);
    return pda;
  }

  beforeEach(() => {
    counterAccountPda = findPda(program.programId, [anchor.utils.bytes.utf8.encode("counter"), adminWallet.publicKey.toBuffer()]);
  })

  it("should initialize counter for user", async () => {
    const tx = await program.methods.initializeCounter().accounts({
      authority: adminWallet.publicKey,
    }).signers([adminWallet]).rpc();

    console.log("  transaction signature: ", tx);
    const counterAccountData = await program.account.counter.fetch(counterAccountPda);
    console.log("  counter authority address: ", counterAccountData.authority.toBase58());
    console.log("  admin wallet address: ", adminWallet.publicKey.toBase58());
    console.log("  counter account pda: ", counterAccountPda.toBase58());
    console.log("  count value: ", counterAccountData.count);

    expect(counterAccountData.authority.toBase58()).to.equal(adminWallet.publicKey.toBase58());
    expect(counterAccountData.count.toString()).to.equal("0");
  });

  it("should return error if same user tries to initialize another counter", async () => {
    try {
      const tx = await program.methods.initializeCounter().accounts({
        authority: adminWallet.publicKey,
      }).signers([adminWallet]).rpc();

      console.log("  transaction signature: ",tx);
    } catch (error) {
      console.error("  you have already created a counter");
      console.error("  logs: ",error.transactionLogs[3]);
    }
  });

  it("should increase the value of count by 1", async() => {
    const tx = await program.methods.incrementCounter().accounts({
      authority: adminWallet.publicKey,
    }).signers([adminWallet]).rpc();

    console.log("  transaction signature: ",tx);
    let counterAccountData = await program.account.counter.fetch(counterAccountPda);
    console.log("  count value: ", counterAccountData.count);
    expect(counterAccountData.count.toString()).to.equal("1");

    // this will make the count value equal to 2
    await program.methods.incrementCounter().accounts({
      authority: adminWallet.publicKey,
    }).signers([adminWallet]).rpc();
    
    counterAccountData = await program.account.counter.fetch(counterAccountPda);
    console.log("  count value: ", counterAccountData.count);
  });

  it("should return error if another user tries to increment the count", async()=> {
    const anotherUser = Keypair.generate();
    try {
      const tx = await program.methods.incrementCounter().accounts({
        authority: anotherUser.publicKey,
      }).signers([adminWallet]).rpc();

      console.log("  transaction signature: ",tx);
    } catch (error) {
      console.log("  another user public key: ", anotherUser.publicKey.toBase58());
      console.error("  error message: ",error.message);
    }
  });

  it("should decrease the value of count by 1", async() => {
    const tx = await program.methods.decrementCounter().accounts({
      authority: adminWallet.publicKey,
    }).signers([adminWallet]).rpc();

    console.log("  transaction signature: ",tx);
    let counterAccountData = await program.account.counter.fetch(counterAccountPda);
    console.log("  count value: ", counterAccountData.count);
    expect(counterAccountData.count.toString()).to.equal("1");
  });

  it("should return error if another user tries to decrement the count", async()=> {
    const anotherUser = Keypair.generate();
    try {
      const tx = await program.methods.decrementCounter().accounts({
        authority: anotherUser.publicKey,
      }).signers([adminWallet]).rpc();

      console.log("  transaction signature: ",tx);
    } catch (error) {
      console.log("  another user public key: ", anotherUser.publicKey.toBase58());
      console.error("  error message: ",error.message);
    }
  });
});
