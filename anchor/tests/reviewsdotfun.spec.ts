// import * as anchor from "@coral-xyz/anchor";
// import { BN, Program } from "@coral-xyz/anchor";
// import { PublicKey, Keypair, SystemProgram, Connection } from "@solana/web3.js";
// import { Reviewsdotfun } from "../target/types/reviewsdotfun";
// import IDL from "../target/idl/reviewsdotfun.json";
// import { BankrunProvider } from "anchor-bankrun";
// import { startAnchor, BanksClient, ProgramTestContext } from "solana-bankrun";
// import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
//
// describe("reviewsdotfun", () => {
//   let admin: Keypair;
//   let globalPda: PublicKey;
//   let program: Program<Reviewsdotfun>;
//   let provider: BankrunProvider;
//   let context: ProgramTestContext;
//   let banksClient: BanksClient;
//   let connection: Connection;
//   const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
//     "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
//   );
//   beforeAll(async () => {
//     context = await startAnchor(
//       "",
//       [{ name: "reviewsdotfun", programId: new PublicKey(IDL.address) }],
//       [
//         // accounts field, accounts other than the provider.wallet.payer
//       ],
//     );
//     provider = new BankrunProvider(context);
//     connection = provider.connection;
//     console.log(connection);
//     anchor.setProvider(provider);
//     program = new Program<Reviewsdotfun>(IDL as Reviewsdotfun, provider);
//     banksClient = context.banksClient;
//     admin = provider.wallet.payer;
//
//     [globalPda] = PublicKey.findProgramAddressSync(
//       [Buffer.from("global")],
//       program.programId,
//     );
//   });
//
//   it("Init global pda", async () => {
//     const feeVault = new anchor.web3.Keypair();
//     const authority = new anchor.web3.Keypair();
//
//     await program.methods
//       .initGlobal({
//         feeVault: feeVault.publicKey,
//         authority: authority.publicKey,
//       })
//       .accounts({})
//       .rpc();
//
//     const globalPdaData = await program.account.global.fetch(
//       globalPda,
//       "confirmed",
//     );
//     console.log(globalPdaData);
//     console.log(globalPdaData.rewardReserves.toNumber());
//     expect(globalPdaData.feeVault).toEqual(feeVault.publicKey);
//   });
//
//   it("create mint and mint token to pool", async () => {
//     const [mintPda] = PublicKey.findProgramAddressSync(
//       [Buffer.from("mint"), Buffer.from("TESTING")],
//       program.programId,
//     );
//     const [metadataPda] = anchor.web3.PublicKey.findProgramAddressSync(
//       [
//         Buffer.from("metadata"),
//         TOKEN_METADATA_PROGRAM_ID.toBuffer(),
//         mintPda.toBuffer(),
//       ],
//       TOKEN_METADATA_PROGRAM_ID,
//     );
//     const mint = await program.methods
//       .createMint({
//         name: "TESTING",
//         symbol: "TEST",
//         uri: "nothingfornow",
//         decimals: 6,
//       })
//       .accounts({
//         // globalPda: globalPda,
//         // mint: mintPda,
//         metadata: metadataPda,
//         // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
//         signer: provider.wallet.publicKey,
//         tokenProgram: TOKEN_PROGRAM_ID,
//       })
//       .rpc();
//   });
// });
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import IDL from "../target/idl/reviewsdotfun.json";
import { Reviewsdotfun } from "../target/types/reviewsdotfun";
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
    const slot = await connection.getSlot();
    console.log("Current slot", slot);

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

    const mintIx = await program.methods
      .createMint({
        name: "TESTING",
        symbol: "TEST",
        uri: "nothingfornow",
        decimals: 6,
      })
      .accounts({
        // globalPda: globalPda,
        // mint: mintPda,
        metadata: metadata,
        // rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        signer: provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .instruction();

    const blockhashContext = await connection.getLatestBlockhash();

    const tx = new anchor.web3.Transaction({
      blockhash: blockhashContext.blockhash,
      lastValidBlockHeight: blockhashContext.lastValidBlockHeight,
      feePayer: wallet.payer.publicKey,
    }).add(mintIx);

    const sig = await anchor.web3.sendAndConfirmTransaction(connection, tx, [
      wallet.payer,
    ]);
    console.log(sig);
  });
});
