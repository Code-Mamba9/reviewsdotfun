use crate::{errors::ReviewFunError, state::*, SOL_BOOTSTRAP_LAMPORTS};
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface}};
use solana_program::system_instruction;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreatePoolArgs {
    pub merchant_key: Pubkey,
}

#[derive(Accounts)]
#[instruction(args: CreatePoolArgs)]
pub struct CreatePool<'info> {
    #[account(mut)]
    pub signer: Signer<'info>, // merchant signer

    #[account(
      mut,
      seeds=[b"mint", args.merchant_key.as_ref()],
      bump
    )]
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
      init, 
      space=8+Pool::INIT_SPACE,
      payer=signer,
      seeds=[b"pool", mint.key().as_ref()],
      bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
      init_if_needed,
      payer=signer,
      associated_token::mint = mint,
      associated_token::authority = pool,
      associated_token::token_program = token_program,
    )]
    pub pool_ata: InterfaceAccount<'info, TokenAccount>,
    #[account(
      seeds=[b"global"],
      bump=global.bump
    )]
    pub global: Account<'info, Global>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl CreatePool<'_> {
    pub fn create_pool(ctx: Context<Self>, _args: CreatePoolArgs) -> Result<()> {
      let global_account = &ctx.accounts.global;
      ctx.accounts.pool.set_inner(Pool {
        mint_a: ctx.accounts.mint.key(),
        pool_sol_lamports: global_account.initial_sol,
        pool_a_amount: ((global_account.token_supply as f64) * (global_account.token_trade_portion)) as u64,
        reward_a_amount: ((global_account.token_supply as f64) * (global_account.token_reward_portion)) as u64,
        fee: global_account.fee_basis_pt,
        bump: ctx.bumps.pool,
        complete: false
      });
      msg!("CreatePool: pool created!");
      
      require!(ctx.accounts.signer.lamports() > SOL_BOOTSTRAP_LAMPORTS, ReviewFunError::BootStrapError);
      let bootstrap_lp_ix = system_instruction::transfer(
        ctx.accounts.signer.key,
        &ctx.accounts.pool.key(),
        SOL_BOOTSTRAP_LAMPORTS
      );
      solana_program::program::invoke_signed(
        &bootstrap_lp_ix,
        &[
          ctx.accounts.signer.to_account_info(),
          ctx.accounts.pool.to_account_info(),
          ctx.accounts.system_program.to_account_info(),
        ],
        &[]
      )?;
      msg!("CreatePool: Bootstrap 1 SOL succeeded!");
      Ok(())
    }
}
