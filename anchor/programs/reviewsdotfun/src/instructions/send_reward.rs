use std::cmp::min;

use crate::{constant::*, errors::ReviewFunError, state::*};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked},
};

#[derive(Accounts)]
//#[instruction(args: MintTokenArgs)]
pub struct SendReward<'info> {
    #[account(mut)]
    pub reviewer: Signer<'info>,

    #[account(mut)]
    mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      seeds=[b"global"],
      bump=global_pda.bump,
    )]
    pub global_pda: Account<'info, Global>,

    #[account(
      mut,
      associated_token::mint=mint,
      associated_token::authority=pool,
    )]
    pub pool_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
      mut,
      seeds=[b"pool", mint.key().as_ref()],
      constraint=!pool.reward_complete @ ReviewFunError::RewardComplete,
      bump=pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
      init_if_needed,
      payer=pool,
      associated_token::mint = mint,
      associated_token::authority = reviewer,
      associated_token::token_program = token_program,
    )]
    pub reviewer_ata: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl SendReward<'_> {
    pub fn send_reward(ctx: Context<Self>) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let real_reward_decimals = min(
            pool.reward_a_amount,
            ctx.accounts.global_pda.reward_decimals,
        );
        pool.apply_reward(real_reward_decimals);
        let signer = &[
            b"pool",
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[pool.bump],
        ];
        let signer_seeds = [&signer[..]];
        let cpi_accounts = TransferChecked {
            from: ctx.accounts.pool_ata.to_account_info(),
            to: ctx.accounts.reviewer_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
            authority: pool.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts).with_signer(&signer_seeds);
        transfer_checked(cpi_ctx, real_reward_decimals, ctx.accounts.mint.decimals)?;
        pool.check_complete();
        Ok(())
    }
}
