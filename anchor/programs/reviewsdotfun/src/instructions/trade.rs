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

        Ok(())
    }
}
