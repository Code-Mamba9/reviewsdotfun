use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface},
};

#[derive(Accounts)]
pub struct WrapSol<'info> {
    #[account(mut)]
    pub user_sol_account: Signer<'info>,
    #[account(
        init_if_needed,
        payer = user_sol_account,
        associated_token::mint = wsol_mint,
        associated_token::authority = user_sol_account,
        associated_token::token_program = token_program,
    )]
    pub user_wsol_ata: InterfaceAccount<'info, TokenAccount>,
    pub wsol_mint: InterfaceAccount<'info, Mint>, // So11111111111111111111111111111111111111112

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

impl WrapSol<'_> {
    pub fn wrap_sol(ctx: Context<WrapSol>) -> Result<()> {
        // transfer sol to token account
        let user_account = &ctx.accounts.user_sol_account;
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: user_account.to_account_info(),
                to: ctx.accounts.user_wsol_ata.to_account_info(),
            },
        );
        system_program::transfer(cpi_context, user_account.lamports())?;

        let cpi_accounts = token_interface::SyncNative {
            account: ctx.accounts.user_wsol_ata.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token_interface::sync_native(cpi_ctx)?;

        Ok(())
    }
}
