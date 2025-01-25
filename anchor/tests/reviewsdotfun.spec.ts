import * as anchor from '@coral-xyz/anchor'
import {Program} from '@coral-xyz/anchor'
import {Keypair} from '@solana/web3.js'
import {Reviewsdotfun} from '../target/types/reviewsdotfun'

describe('reviewsdotfun', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Reviewsdotfun as Program<Reviewsdotfun>

  const reviewsdotfunKeypair = Keypair.generate()

  it('Initialize Reviewsdotfun', async () => {
    await program.methods
      .initialize()
      .accounts({
        reviewsdotfun: reviewsdotfunKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([reviewsdotfunKeypair])
      .rpc()

    const currentCount = await program.account.reviewsdotfun.fetch(reviewsdotfunKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Reviewsdotfun', async () => {
    await program.methods.increment().accounts({ reviewsdotfun: reviewsdotfunKeypair.publicKey }).rpc()

    const currentCount = await program.account.reviewsdotfun.fetch(reviewsdotfunKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Reviewsdotfun Again', async () => {
    await program.methods.increment().accounts({ reviewsdotfun: reviewsdotfunKeypair.publicKey }).rpc()

    const currentCount = await program.account.reviewsdotfun.fetch(reviewsdotfunKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Reviewsdotfun', async () => {
    await program.methods.decrement().accounts({ reviewsdotfun: reviewsdotfunKeypair.publicKey }).rpc()

    const currentCount = await program.account.reviewsdotfun.fetch(reviewsdotfunKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set reviewsdotfun value', async () => {
    await program.methods.set(42).accounts({ reviewsdotfun: reviewsdotfunKeypair.publicKey }).rpc()

    const currentCount = await program.account.reviewsdotfun.fetch(reviewsdotfunKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the reviewsdotfun account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        reviewsdotfun: reviewsdotfunKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.reviewsdotfun.fetchNullable(reviewsdotfunKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
