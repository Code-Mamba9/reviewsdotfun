use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, Mint, MintTo, TokenAccount, TokenInterface};

#[derive(Accounts)]
#[instruction(merchant_key: Pubkey)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      mut,
      seeds=[b"mint", &merchant_key.to_bytes()],
      bump,
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      seeds=[b"global"],
      bump=global_pda.bump,
    )]
    pub global_pda: Account<'info, Global>,

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
    //fn validate(&self) -> Result<()> {
    //    todo!()
    //}
    //
    //#[access_control(ctx.accounts.validate())]
    pub fn create_mint(ctx: Context<Self>) -> Result<()> {
        let signer_seeds: &[&[&[u8]]] = &[&[b"global", &[ctx.bumps.mint]]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.global_token_account.to_account_info(),
            authority: ctx.accounts.global_pda.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);
        token_interface::mint_to(cpi_context, 1_000_000_000_000)?;
        Ok(())
    }
}
