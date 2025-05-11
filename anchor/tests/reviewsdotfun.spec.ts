import * as anchor from "@coral-xyz/anchor";
import { BN, Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import IDL from "../target/idl/reviewsdotfun.json";
import { Reviewsdotfun } from "../target/types/reviewsdotfun";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { PublicKey } from "@solana/web3.js";
import { ProgramTestContext } from "solana-bankrun";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { getAssociatedTokenAddress, getMint } from "@solana/spl-token";
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
  const feeVault = new anchor.web3.Keypair();
  const authority = new anchor.web3.Keypair();

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
    let txhash = await connection.requestAirdrop(feeVault.publicKey, 1e9);
    console.log(txhash);
    // program2 = new Program<Reviewsdotfun>(
    //   IDL as Reviewsdotfun,
    //   merchantProvider,
    // );
  });

  const program = new Program<Reviewsdotfun>(IDL as Reviewsdotfun, provider);

  const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  it("Init Global, Mint and Merchant Pool!", async () => {
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
      tokenProgram: TOKEN_PROGRAM_ID,
    };
    let mintAcc = await getMint(connection, mint);

    await program.methods
      .createPool({
        merchantKey: merchant.publicKey,
      })
      .accounts(poolContext)
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    const [pool] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("pool"), mint.toBuffer()],
      program.programId,
    );
    // console.log(mintAcc);
    // console.log(globalPda);

    const poolAta = anchor.utils.token.associatedAddress({
      mint,
      owner: pool,
    });

    const mintTokenCtx = {
      mint,
      globalPda,
      poolAta,
      pool,
      rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    };

    await program.methods
      .mintToken({
        merchantKey: merchant.publicKey,
      })
      .accounts(mintTokenCtx)
      .rpc({ skipPreflight: true, commitment: "confirmed" });

    console.log(pool.toString());
    console.log(feeVault.publicKey.toString());
    // const globalPdaData = await program.account.global.fetch(
    //   globalPda,
    //   "confirmed",
    // );
    // console.log(globalPdaData);
    //
    // Swapping
    const buyCtx = {
      feeVault: feeVault.publicKey,
      mint,
      pool,
      poolAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
      systemProgram: anchor.web3.SystemProgram.programId,
    };
    await program.methods
      .trade({
        amount: new BN(100000000),
        buy: true,
      })
      .accounts(buyCtx)
      .rpc({ skipPreflight: true, commitment: "confirmed" });
  });
});
