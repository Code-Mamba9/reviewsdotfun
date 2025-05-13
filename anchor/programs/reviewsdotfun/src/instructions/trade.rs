use crate::{error::*, MIN_OUT_TOKEN};
use crate::errors::ReviewFunError;
use crate::state::*;
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, token, token_interface::{transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked}
};
use solana_program::system_instruction;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct TradeArgs {
    pub amount: u64,
    pub buy: bool,
}

#[derive(Accounts)]
#[instruction()]
pub struct Trade<'info> {
    #[account(mut)]
    pub trader: Signer<'info>,

    #[account(mut)]
    /// CHECK: fee reciever asserted in validation function
    pub fee_vault: AccountInfo<'info>,

    mint: InterfaceAccount<'info, Mint>,

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
        let TradeArgs{ amount, buy } = args;
        let trader = &ctx.accounts.trader;
        if buy {
          // buy token using sol
          let buy_result = pool.apply_buy(amount).ok_or(ReviewFunError::BuyError)?;
          let BuyResult { token_decimals, sol_lamports, .. } = buy_result;
          let fee = pool.calc_fee(sol_lamports)?;
          msg!("Buy token fee is {}", fee);


          // complete user buy
          require!(token_decimals >= MIN_OUT_TOKEN, ReviewFunError::SlippageExceeded);
          require!(trader.get_lamports() >= fee, ReviewFunError::InsufficientBalance);

          // transfer token to trader
          let cpi_accounts = TransferChecked {
            from: ctx.accounts.pool_ata.to_account_info(),
            authority: ctx.accounts.pool.to_account_info(),
            to: ctx.accounts.trader_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
          };

          let signer = &[
            b"pool",
            ctx.accounts.mint.to_account_info().key.as_ref(),
            &[ctx.accounts.pool.bump]
          ];
          let signer_seeds = [&signer[..]];
          let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, &signer_seeds);
          transfer_checked(cpi_ctx, token_decimals, ctx.accounts.mint.decimals)?;
          // transfer sol to bonding curve and fee vault
          let transfer_pool_ix = system_instruction::transfer(
            ctx.accounts.trader.key,
            &ctx.accounts.pool.key(),
            sol_lamports,
          );
          solana_program::program::invoke_signed(
            &transfer_pool_ix,
            &[
              ctx.accounts.trader.to_account_info(),
              ctx.accounts.pool.to_account_info(),
              ctx.accounts.system_program.to_account_info(),
            ],
            &[]
          )?;
          msg!("SOL transferred to the pool");

          let transfer_fee_ix = system_instruction::transfer(
            ctx.accounts.trader.key,
            &ctx.accounts.fee_vault.key(),
            fee,
          );
          solana_program::program::invoke_signed(
            &transfer_fee_ix,
            &[
              ctx.accounts.trader.to_account_info(),
              ctx.accounts.fee_vault.to_account_info(), // daocli implementation is clone()
              ctx.accounts.system_program.to_account_info(),
            ],
            &[]
          )?;
          msg!("SOL transferred to the fee vault");
        } else {          // sell token and get sol
          msg!("SellToken trader ata balance: {}", ctx.accounts.trader_ata.amount);
          require!(ctx.accounts.trader_ata.amount >= amount, ReviewFunError::InsufficientLamports);
          let sell_result = pool.apply_sell(amount).ok_or(ReviewFunError::SellError)?;
          let SellResult{ token_decimals, sol_lamports, ..} = sell_result;
          let fee = pool.calc_fee(sol_lamports)?;
          msg!("Sell token fee is {}", fee);

          // complete user sell
          require!(sol_lamports >= MIN_OUT_TOKEN, ReviewFunError::SlippageExceeded);
          require!(trader.get_lamports() >= fee, ReviewFunError::InsufficientBalance);
          // transfer token to the pool
          let cpi_accounts = TransferChecked {
            from: ctx.accounts.trader_ata.to_account_info(),
            authority: ctx.accounts.trader.to_account_info(),
            to: ctx.accounts.pool_ata.to_account_info(),
            mint: ctx.accounts.mint.to_account_info(),
          };

          msg!("SellToken: tokendecimals:{}", token_decimals);
          let cpi_ctx = CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts);
          transfer_checked(cpi_ctx, token_decimals, ctx.accounts.mint.decimals)?;
          msg!("Token transferred to the pool");
          // transfer sol to trader
          let transferred_lamports = sol_lamports - fee;
          ctx.accounts.trader.add_lamports(transferred_lamports)?;
          ctx.accounts.fee_vault.add_lamports(fee)?;
          ctx.accounts.pool.sub_lamports(sol_lamports)?;
          msg!("CompleteSell, sol transfer: {}, fee transfer {}", transferred_lamports, fee);
        }
        Ok(())
    }
}
