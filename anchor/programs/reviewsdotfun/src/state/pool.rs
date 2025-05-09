//use crate::{error::*, errors::ReviewFunError};
use anchor_lang::prelude::*;

#[account]
#[derive(Default, InitSpace)]
pub struct Pool {
    pub mint_a: Pubkey,
    pub pool_sol_lamports: u64,
    pub pool_a_amount: u64,
    pub reward_a_amount: u64,
    pub fee: u8,
    pub bump: u8,
    pub complete: bool,
}
#[derive(Debug, Clone)]
pub struct BuyResult {
    pub token_amount: u64,    // user receive
    pub sol_lamports: u64,    // user sell
    pub price_per_token: f64, // per sol
}

#[derive(Debug, Clone)]
pub struct SellResult {
    pub token_amount: u64,    // user sell
    pub sol_lamports: u64,    // user receive
    pub price_per_token: f64, // per sol
}

impl Pool {
    pub fn calc_fee(&self, sol_lamports: u64) -> Result<u64> {
        Ok(sol_lamports / 200)
    }

    pub fn apply_buy(&mut self, sol_lamports: u64) -> Option<BuyResult> {
        msg!(
            "Applying buy {} sol",
            sol_lamports.checked_div(1_000_000_000)?
        );

        let token_amount = match self.get_tokens_for_buy_sol(sol_lamports) {
            Some(a_amount) => {
                self.pool_a_amount = self.pool_a_amount.checked_sub(a_amount)?;
                self.pool_sol_lamports = self.pool_sol_lamports.checked_add(sol_lamports)?;
                a_amount
            }
            None => 0,
        };
        msg!("ApplyBuy, token_amount: {}", token_amount);

        let price_per_token: f64 = if token_amount > 0 {
            (self.pool_sol_lamports as f64) / (self.pool_a_amount as f64)
        } else {
            0.0
        };
        msg!("ApplyBuy, price_per_token: {}", price_per_token);

        Some(BuyResult {
            token_amount,
            sol_lamports,
            price_per_token,
        })
    }

    pub fn get_tokens_for_buy_sol(&self, sol_lamports: u64) -> Option<u64> {
        if sol_lamports == 0 {
            return None;
        }

        let product = self.pool_a_amount.checked_mul(self.pool_sol_lamports)?;
        msg!("GetTokensForBuySol k: {}", product);

        let new_sol_lamports = self.pool_sol_lamports.checked_add(sol_lamports)?;
        msg!("GetTokensForBuySol new sol lamports: {}", new_sol_lamports);

        let new_a_amount = product.checked_div(new_sol_lamports)?;
        msg!("GetTokensForBuySol new a amount: {}", new_a_amount);

        let token_to_user = self.pool_a_amount.checked_sub(new_a_amount)?;
        msg!("GetTokensForBuySol a to user: {}", token_to_user);

        Some(token_to_user)
    }
}
