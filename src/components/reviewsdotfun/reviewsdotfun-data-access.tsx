'use client'

import { getReviewsdotfunProgram, getReviewsdotfunProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useReviewsdotfunProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getReviewsdotfunProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getReviewsdotfunProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['reviewsdotfun', 'all', { cluster }],
    queryFn: () => program.account.reviewsdotfun.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['reviewsdotfun', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ reviewsdotfun: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useReviewsdotfunProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useReviewsdotfunProgram()

  const accountQuery = useQuery({
    queryKey: ['reviewsdotfun', 'fetch', { cluster, account }],
    queryFn: () => program.account.reviewsdotfun.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['reviewsdotfun', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ reviewsdotfun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['reviewsdotfun', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ reviewsdotfun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['reviewsdotfun', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ reviewsdotfun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['reviewsdotfun', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ reviewsdotfun: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
