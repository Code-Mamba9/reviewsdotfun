"use client";

import {
  getReviewsdotfunProgram,
  getReviewsdotfunProgramId,
} from "@project/anchor";
import { useConnection } from "@solana/wallet-adapter-react";
import {
  Cluster,
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SYSTEM_PROGRAM_ID,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  getMint,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useCluster } from "../cluster/cluster-data-access";
import { useAnchorProvider } from "../solana/solana-provider";
import { useTransactionToast } from "../ui/ui-layout";
import { BN } from "bn.js";

const TOKEN_METADATA_PROGRAM_ID = new PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
);

interface InitGlobalArgs {
  authority: PublicKey;
  fee_vault: PublicKey;
}
interface CreateMintArgs {
  name: string;
  symbol: string;
  uri: string;
  decimals: number;
  merchantKey: PublicKey;
}
interface CreatePoolArgs {
  merchantKey: PublicKey;
}
interface TradeArgs {
  amount: BN;
  buy: bool;
  feeVault: PublicKey;
  merchantKey: PublicKey;
}

export function useReviewsdotfunProgram() {
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const provider = useAnchorProvider();
  const programId = useMemo(
    () => getReviewsdotfunProgramId(cluster.network as Cluster),
    [cluster],
  );
  const program = useMemo(
    () => getReviewsdotfunProgram(provider, programId),
    [provider, programId],
  );

  const accounts = useQuery({
    queryKey: ["reviewsdotfun", "all", { cluster }],
    queryFn: () => program.account.pool.all(),
  });

  const getProgramAccount = useQuery({
    queryKey: ["get-program-account", { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  });

  // program defined IXs
  const initGlobal = useMutation({
    mutationKey: ["reviewsdotfun", "initGlobal", { cluster }],
    mutationFn: (args: InitGlobalArgs) =>
      program.methods.initGlobal(args).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to initialize global"),
  });

  const createMint = useMutation({
    mutationKey: ["reviewsdotfun", "createMint", { cluster }],
    mutationFn: async (args: CreateMintArgs) => {
      let [mint] = await PublicKey.findProgramAddress(
        [Buffer.from("mint"), args.merchantKey.toBuffer()],
        program.programId,
      );
      const [metadata] = await PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID,
      );
      return program.methods
        .createMint(args)
        .accounts({ metadata, tokenProgram: TOKEN_PROGRAM_ID })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to create Mint"),
  });

  const createPool = useMutation({
    mutationKey: ["reviewsdotfun", "createPool", { cluster }],
    mutationFn: async (args: CreatePoolArgs, mint: PublicKey) => {
      return program.methods
        .createPool(args)
        .accounts({ mint, tokenProgram: TOKEN_PROGRAM_ID })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to create Pool"),
  });

  const wrapSol = useMutation({
    mutationKey: ["reviewsdotfun", "wrapSol", { cluster }],
    mutationFn: async (userWallet: publicKey) => {
      const userWsolAta = await getAssociatedTokenAddress({
        mint: NATIVE_MINT,
        owner: userwallet,
      });
      return program.methods
        .wrapSol(args)
        .accounts({ wsolMint: NATIVE_MINT, userWsolAta })
        .rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      return accounts.refetch();
    },
    onError: () => toast.error("Failed to create Pool"),
  });

  const mintToken = useMutation({
    mutationKey: ["reviewsdotfun", "mintToken", { cluster }],
    mutationFn: async (merchant: publicKey) => {
      const [globalPda] = await PublicKey.findProgramAddress(
        [Buffer.from("global")],
        program.programId,
      );
      const [mint] = await PublicKey.findProgramAddress(
        [Buffer.from("mint"), merchant.toBuffer()],
        program.programId,
      );
      const [pool] = await PublicKey.findProgramAddress(
        [Buffer.from("pool"), mint.toBuffer()],
        program.programId,
      );
      const poolAta = await getAssociatedTokenAddress(mint, pool, true);
      console.log(poolAta.toBase58());

      const mintTokenCtx = {
        mint,
        globalPda,
        poolAta,
        pool,
        rent: SYSVAR_RENT_PUBKEY,
        tokenProgram: TOKEN_PROGRAM_ID,
      };
      return program.methods
        .mintToken({ merchantKey: merchant })
        .accounts(mintTokenCtx)
        .rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const sendReward = useMutation({
    mutationKey: ["reviewsdotfun", "sendReward", { cluster }],
    mutationFn: async (merchant: publicKey) => {
      const [globalPda] = await PublicKey.findProgramAddress(
        [Buffer.from("global")],
        program.programId,
      );
      const [mint] = await PublicKey.findProgramAddress(
        [Buffer.from("mint"), merchant.toBuffer()],
        program.programId,
      );
      const [pool] = await PublicKey.findProgramAddress(
        [Buffer.from("pool"), mint.toBuffer()],
        program.programId,
      );
      const poolAta = await getAssociatedTokenAddress(mint, pool, true);

      const rewardCtx = {
        mint,
        globalPda,
        poolAta,
        pool,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      };
      return program.methods.sendReward().accounts(rewardCtx).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  const trade = useMutation({
    mutationKey: ["reviewsdotfun", "trade", { cluster }],
    mutationFn: async (args: TradeArgs) => {
      const { feeVault, merchantKey, amount, buy } = args;
      const [mint] = await PublicKey.findProgramAddress(
        [Buffer.from("mint"), merchantKey.toBuffer()],
        program.programId,
      );
      const [pool] = await PublicKey.findProgramAddress(
        [Buffer.from("pool"), mint.toBuffer()],
        program.programId,
      );
      const poolAta = await getAssociatedTokenAddress(mint, pool, true);

      const tradeCtx = {
        feeVault,
        mint,
        poolAta,
        pool,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SYSTEM_PROGRAM_ID,
      };
      return program.methods.trade({ amount, buy }).accounts(tradeCtx).rpc();
    },
    onSuccess: (tx) => {
      transactionToast(tx);
      return accounts.refetch();
    },
  });

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initGlobal,
    createMint,
    createPool,
    mintToken,
    sendReward,
    wrapSol,
    trade,
  };
}

export function useReviewsdotfunProgramAccount({
  account,
}: {
  account: PublicKey;
}) {
  const { cluster } = useCluster();
  const transactionToast = useTransactionToast();
  const { program, accounts } = useReviewsdotfunProgram();

  const accountQuery = useQuery({
    queryKey: ["reviewsdotfun", "fetch", { cluster, account }],
    queryFn: () => program.account.pool.fetch(account),
  });

  return {
    accountQuery,
  };
}
