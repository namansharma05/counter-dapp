import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Counter } from "../target/types/counter";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { expect } from "chai";
import { PublicKey } from "@solana/web3.js";

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

  it("Is initialized!", async () => {
    const tx = await program.methods.initializeCounter().accounts({
      authority: adminWallet.publicKey,
    }).signers([adminWallet]).rpc();

    console.log("  transaction signature: ", tx);
    const counterAccountData = await program.account.counter.fetch(counterAccountPda);
    console.log("  counter authority address: ", counterAccountData.authority.toBase58());
    console.log("  admin wallet address: ", adminWallet.publicKey.toBase58());

    expect(counterAccountData.authority.toBase58()).to.equal(adminWallet.publicKey.toBase58());
    expect(counterAccountData.count.toString()).to.equal("0");

  });
});
