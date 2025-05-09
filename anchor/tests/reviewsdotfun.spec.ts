import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import IDL from "../target/idl/reviewsdotfun.json";
import { Reviewsdotfun } from "../target/types/reviewsdotfun";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { PublicKey } from "@solana/web3.js";
import { ProgramTestContext } from "solana-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { getMint } from "@solana/spl-token";
describe("reviewsdotfun", () => {
  // Configure the client to use the local cluster.
  const merchant = new anchor.web3.Keypair();
  const provider = anchor.AnchorProvider.env();
  const wallet = provider.wallet as anchor.Wallet;
  const connection = provider.connection;
  anchor.setProvider(provider);
  let context: ProgramTestContext;
  let merchantProvider: BankrunProvider;
  let program2: Program<Reviewsdotfun>;

  beforeAll(async () => {
    context = await startAnchor(
      "",
      [{ name: "reviewsdotfun", programId: new PublicKey(IDL.address) }],
      [
        {
          address: merchant.publicKey,
          info: {
            lamports: 1_000_000_000,
            data: Buffer.alloc(0),
            owner: SYSTEM_PROGRAM_ID,
            executable: false,
          },
        },
      ],
    );

    merchantProvider = new BankrunProvider(context);
    merchantProvider.wallet = new NodeWallet(merchant) as anchor.Wallet;
    program2 = new Program<Reviewsdotfun>(
      IDL as Reviewsdotfun,
      merchantProvider,
    );
  });

  const program = new Program<Reviewsdotfun>(IDL as Reviewsdotfun, provider);

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  it("Init Global, Mint and Merchant Pool!", async () => {
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
      .accounts({ payer: wallet.publicKey })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    let [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), merchant.publicKey.toBuffer()],
      program.programId,
    );

    const [metadata] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("metadata"),
        TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        mint.toBuffer(),
      ],
      TOKEN_METADATA_PROGRAM_ID,
    );

    // Create Token Mint
    await program.methods
      .createMint({
        name: "TESTING",
        symbol: "TEST",
        uri: "nothingfornow",
        decimals: 6,
        merchantKey: merchant.publicKey,
      })
      .accounts({
        metadata: metadata,
        signer: wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    // Create Pool
    [mint] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), merchant.publicKey.toBuffer()],
      program.programId,
    );

    const poolContext = {
      mint,
      signer: merchant.publicKey,
      tokenProgram: TOKEN_PROGRAM_ID,
    };
    let mintAcc = await getMint(connection, mint);

    console.log(poolContext);
    console.log(mintAcc);

    // await program2.methods
    //   .createPool({
    //     merchantKey: merchant.publicKey,
    //   })
    //   .accounts(poolContext)
    //   .signers([merchant])
    //   .rpc({ skipPreflight: true, commitment: "confirmed" });
    //
    // const globalPdaData = await program.account.global.fetch(
    //   globalPda,
    //   "confirmed",
    // );

    // console.log(pool);

    // console.log(globalPdaData);
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
