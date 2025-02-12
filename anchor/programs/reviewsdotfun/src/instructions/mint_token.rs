use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
#[instruction(merchant: String)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      mut,
      seeds=[b"mint"],
      bump,
      mint::authority=global_pda
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      seeds=[b"global"],
      bump=global_pda.bump,
    )]
    pub global_pda: Account<'info, Global>,

    //#[account(
    //  init,
    //  payer=signer,
    //  token::mint = mint,
    //  token::authority = global_token_account,
    //  seeds=[b"global_token_account", merchant.as_bytes()],
    //  bump,
    //)]
    //pub global_token_account: InterfaceAccount<'info, TokenAccount>,
    //
    //
    #[account(
      init_if_needed,
      payer=signer,
      associated_token::mint = mint,
      associated_token::authority = global_pda,
      associated_token::token_program = token_program,
    )]
    pub global_token_account: InterfaceAccount<'info, TokenAccount>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl MintToken<'_> {
    fn validate(&self) -> Result<()> {
        todo!()
    }

    #[access_control(ctx.accounts.validate())]
    pub fn create_mint(ctx: Context<Self>) -> Result<()> {
        Ok(())
    }
}
