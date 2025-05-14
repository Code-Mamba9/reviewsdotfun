use anchor_lang::prelude::*;

declare_program!(pump_amm);
use pump_amm::{
    accounts::{GlobalConfig, Pool},
    cpi::{accounts::CreatePool, create_pool},
};

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct MigrateArgs {
    pub index: u16,
    pub base_amount_in: u64,
    pub quote_amount_in: u64,
}

#[derive(Accounts)]
pub struct Migrate<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(
        init,
        seeds = [b"pool".as_ref(), &index.to_le_bytes(), creator.key().as_ref(), base_mint.key().as_ref(), quote_mint.key().as_ref()],
        bump,
        payer = creator,
        space = 8 + std::mem::size_of::<Pool>(),
    )]
    pub pool: Account<'info, Pool>,
    #[account(
        seeds = [b"global_config".as_ref()],
        bump,
    )]
    pub global_config: Account<'info, GlobalConfig>,
    pub base_mint: InterfaceAccount<'info, Mint>,
    pub quote_mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        seeds = [b"pool_lp_mint".as_ref(), pool.key().as_ref()],
        bump,
        payer = creator,
        mint::decimals = 6,
        mint::authority = pool,
    )]
    pub lp_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = base_mint,
        associated_token::authority = creator,
    )]
    pub user_base_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        associated_token::mint = quote_mint,
        associated_token::authority = creator,
    )]
    pub user_quote_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = creator,
        associated_token::mint = lp_mint,
        associated_token::authority = creator,
    )]
    pub user_pool_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        seeds = [pool.key().as_ref(), base_token_program.key().as_ref(), base_mint.key().as_ref()],
        bump,
        payer = creator,
        token::mint = base_mint,
        token::authority = pool,
    )]
    pub pool_base_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        seeds = [pool.key().as_ref(), quote_token_program.key().as_ref(), quote_mint.key().as_ref()],
        bump,
        payer = creator,
        token::mint = quote_mint,
        token::authority = pool,
    )]
    pub pool_quote_token_account: InterfaceAccount<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_2022_program: Interface<'info, TokenInterface>,
    pub base_token_program: Interface<'info, TokenInterface>,
    pub quote_token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    #[account(
        seeds = [b"__event_authority".as_ref()],
        bump,
    )]
    pub token_program: Interface<'info, TokenInterface>,
    pub event_authority: UncheckedAccount<'info>,
    pub pump_amm_program: Program<'info, pump_amm::program::PumpAmm>,
}

impl Migrate<'_> {
    pub fn create_pool_cpi(ctx: Context<Self>, args: MigrateArgs) -> Result<()> {
        let MigrateArgs {
            index,
            base_amount_in,
            quote_amount_in,
        } = args;
        let cpi_ctx = CpiContext::new(
            ctx.accounts.pump_amm_program.to_account_info(),
            CreatePool {
                pool: ctx.accounts.pool.to_account_info(),
                global_config: ctx.accounts.global_config.to_account_info(),
                creator: ctx.accounts.creator.to_account_info(),
                base_mint: ctx.accounts.base_mint.to_account_info(),
                quote_mint: ctx.accounts.quote_mint.to_account_info(),
                lp_mint: ctx.accounts.lp_mint.to_account_info(),
                user_base_token_account: ctx.accounts.user_base_token_account.to_account_info(),
                user_quote_token_account: ctx.accounts.user_quote_token_account.to_account_info(),
                user_pool_token_account: ctx.accounts.user_pool_token_account.to_account_info(),
                pool_base_token_account: ctx.accounts.pool_base_token_account.to_account_info(),
                pool_quote_token_account: ctx.accounts.pool_quote_token_account.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                token_2022_program: ctx.accounts.token_2022_program.to_account_info(),
                base_token_program: ctx.accounts.base_token_program.to_account_info(),
                quote_token_program: ctx.accounts.quote_token_program.to_account_info(),
                associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
                event_authority: ctx.accounts.event_authority.to_account_info(),
                program: ctx.accounts.pump_amm_program.to_account_info(),
            },
        );
        create_pool(cpi_ctx, index, base_amount_in, quote_amount_in)?;
        Ok(())
    }
}
