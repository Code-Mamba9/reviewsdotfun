// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import ReviewsdotfunIDL from '../target/idl/reviewsdotfun.json'
import type { Reviewsdotfun } from '../target/types/reviewsdotfun'

// Re-export the generated IDL and type
export { Reviewsdotfun, ReviewsdotfunIDL }

// The programId is imported from the program IDL.
export const REVIEWSDOTFUN_PROGRAM_ID = new PublicKey(ReviewsdotfunIDL.address)

// This is a helper function to get the Reviewsdotfun Anchor program.
export function getReviewsdotfunProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...ReviewsdotfunIDL, address: address ? address.toBase58() : ReviewsdotfunIDL.address } as Reviewsdotfun, provider)
}

// This is a helper function to get the program ID for the Reviewsdotfun program depending on the cluster.
export function getReviewsdotfunProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Reviewsdotfun program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return REVIEWSDOTFUN_PROGRAM_ID
  }
}
