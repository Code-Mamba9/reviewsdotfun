import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import IDL from "../target/idl/reviewsdotfun.json";
import { Reviewsdotfun } from "../target/types/reviewsdotfun";
import { PublicKey, Keypair, SystemProgram, Connection } from "@solana/web3.js";
describe("reviewsdotfun", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  const connection = provider.connection;
  const wallet = provider.wallet as anchor.Wallet;
  anchor.setProvider(provider);

  const program = new Program<Reviewsdotfun>(IDL as Reviewsdotfun, provider);

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  it("Is initialized!", async () => {
    const feeVault = new anchor.web3.Keypair();
    const authority = new anchor.web3.Keypair();

    const [globalPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("global")],
      program.programId,
    );

    await program.methods
      .initGlobal({
        feeVault: feeVault.publicKey,
        authority: authority.publicKey,
      })
      .accounts({ payer: provider.wallet.publicKey })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    const mint = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), Buffer.from("TESTING")],
      program.programId,
    )[0];

    const metadata = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    )[0];

    await program.methods
      .createMint({
        name: "TESTING",
        symbol: "TEST",
        uri: "nothingfornow",
        decimals: 6,
      })
      .accounts({
        metadata: metadata,
        signer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    const globalPdaData = await program.account.global.fetch(
      globalPda,
      "confirmed",
    );
    console.log(globalPdaData);
    console.log(mint);
  });
});

// const mintIx = await program.methods
//   .createMint({
//     name: "TESTING",
//     symbol: "TEST",
//     uri: "nothingfornow",
//     decimals: 6,
//   })
//   .accounts({
//     metadata: metadata,
//     signer: wallet.publicKey,
//     tokenProgram: TOKEN_PROGRAM_ID,
//   })
//   .instruction();
//
// const blockhashContext = await connection.getLatestBlockhash();
//
// const tx = new anchor.web3.Transaction({
//   blockhash: blockhashContext.blockhash,
//   lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
//   feePayer: wallet.payer.publicKey,
// }).add(mintIx);
//
// const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
//   wallet.payer,
// ]);
