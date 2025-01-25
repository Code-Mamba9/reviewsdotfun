#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod reviewsdotfun {
    use super::*;

  pub fn close(_ctx: Context<CloseReviewsdotfun>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.reviewsdotfun.count = ctx.accounts.reviewsdotfun.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.reviewsdotfun.count = ctx.accounts.reviewsdotfun.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeReviewsdotfun>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.reviewsdotfun.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeReviewsdotfun<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Reviewsdotfun::INIT_SPACE,
  payer = payer
  )]
  pub reviewsdotfun: Account<'info, Reviewsdotfun>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseReviewsdotfun<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub reviewsdotfun: Account<'info, Reviewsdotfun>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub reviewsdotfun: Account<'info, Reviewsdotfun>,
}

#[account]
#[derive(InitSpace)]
pub struct Reviewsdotfun {
  count: u8,
}
