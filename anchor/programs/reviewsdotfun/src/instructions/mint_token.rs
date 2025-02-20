use crate::{constant::*, state::*};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{self, Mint, MintTo, TokenAccount, TokenInterface};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MintTokenArgs {
    pub merchant_key: Pubkey,
}

#[derive(Accounts)]
#[instruction(args: MintTokenArgs)]
pub struct MintToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      mut,
      seeds=[b"mint", &args.merchant_key.to_bytes()],
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
      associated_token::mint=mint,
      associated_token::authority=pool,
    )]
    pub pool_ata: InterfaceAccount<'info, TokenAccount>,

    #[account(
      seeds=[b"pool", mint.key().as_ref()],
      bump=pool.bump
    )]
    pub pool: Account<'info, Pool>,

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
    pub fn mint_token(ctx: Context<Self>, _args: MintTokenArgs) -> Result<()> {
        let signer_seeds: &[&[&[u8]]] = &[&[b"global", &[ctx.bumps.mint]]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.mint.to_account_info(),
            to: ctx.accounts.pool_ata.to_account_info(),
            authority: ctx.accounts.global_pda.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_context = CpiContext::new(cpi_program, cpi_accounts).with_signer(signer_seeds);
        token_interface::mint_to(cpi_context, TOKEN_SUPPLY)?;
        Ok(())
    }
}
