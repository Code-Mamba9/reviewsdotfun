use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{associated_token::AssociatedToken, token_interface::{Mint, TokenAccount, TokenInterface}};

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
      ctx.accounts.pool.set_inner(Pool {
        mint_a: ctx.accounts.mint.key(),
        pool_sol_amount: ctx.accounts.global.initial_sol_reserve,
        pool_a_amount: ctx.accounts.global.initial_token_a_reserves,
        reward_a_amount: ctx.accounts.global.reward_reserves,
        k: ctx.accounts.global.initial_sol_reserve.checked_mul(ctx.accounts.global.initial_token_a_reserves).unwrap(), // TODO: Handles potential overflow
        fee: ctx.accounts.global.fee_basis_pt,
        bump: ctx.bumps.pool,
      });
      Ok(())
    }
}
