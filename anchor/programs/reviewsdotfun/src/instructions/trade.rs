use crate::error::*;
use crate::errors::ReviewFunError;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TradeArgs {
    pub merchant_key: Pubkey,
    pub amount: u64,
    pub buy: bool,
}

#[derive(Accounts)]
#[instruction(args: TradeArgs)]
pub struct Trade<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(
      mut,
      seeds=[b"mint", args.merchant_key.as_ref()],
      bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      seeds=[b"pool", mint.key().as_ref()],
      bump=pool.bump
    )]
    pub pool: Account<'info, Pool>,

    #[account(
      mut, 
      associated_token::mint=mint,
      associated_token::authority=pool,
    )]
    pub pool_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
      init_if_needed,
      payer=trader,
      associated_token::mint = mint,
      associated_token::authority = trader,
      associated_token::token_program = token_program,
    )]
    pub trader_ata: InterfaceAccount<'info, TokenAccount>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

impl Trade<'_> {
    pub fn trade(ctx: Context<Self>, args: TradeArgs) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        let output_amount: u64 = pool.calculate(args.buy, args.amount, pool.fee).unwrap(); // TODO: Error Handling
        let trader_accountinfo = ctx.accounts.trader.to_account_info();
        let mut trader_lamports = trader_accountinfo.try_borrow_mut_lamports()?;
        if args.buy {
            let transfer_amount: u64 = args
                .amount
                .checked_mul(1_000_000_000)
                .ok_or(ReviewFunError::OverFlowU64)?;
            require!(
                **trader_lamports > transfer_amount,
                ReviewFunError::InsufficientLamports
            );
            **trader_lamports -= transfer_amount;
            let pool_accountinfo = ctx.accounts.pool.to_account_info();
            **pool_accountinfo.try_borrow_mut_lamports()? += transfer_amount;
        }
        Ok(())
    }
}
