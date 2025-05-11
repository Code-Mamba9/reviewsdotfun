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
    pub token_decimals: u64,  // user receive
    pub sol_lamports: u64,    // user sell
    pub price_per_token: f64, // per sol
}

#[derive(Debug, Clone)]
pub struct SellResult {
    pub token_decimals: u64,  // user sell
    pub sol_lamports: u64,    // user receive
    pub price_per_token: f64, // per sol
}

impl Pool {
    pub fn calc_fee(&self, sol_lamports: u64) -> Result<u64> {
        Ok(sol_lamports / 200)
    }

    pub fn apply_buy(&mut self, sol_lamports: u64) -> Option<BuyResult> {
        let token_decimals = match self.get_tokens_for_buy_sol(sol_lamports) {
            Some(a_decimals) => {
                self.pool_a_amount = self.pool_a_amount.checked_sub(a_decimals)?;
                self.pool_sol_lamports = self.pool_sol_lamports.checked_add(sol_lamports)?;
                a_decimals
            }
            None => 0,
        };
        msg!("ApplyBuy, token_decimals: {}", token_decimals);

        let price_per_token: f64 = if token_decimals > 0 {
            (self.pool_sol_lamports as f64) / (self.pool_a_amount as f64)
        } else {
            0.0
        };
        msg!("ApplyBuy, price_per_token: {}", price_per_token);

        Some(BuyResult {
            token_decimals,
            sol_lamports,
            price_per_token,
        })
    }

    pub fn apply_sell(&mut self, token_decimals: u64) -> Option<SellResult> {
        let sol_lamports = match self.get_sol_for_buy_token(token_decimals) {
            Some(lamports) => {
                self.pool_sol_lamports = self.pool_sol_lamports.checked_sub(lamports)?;
                self.pool_a_amount = self.pool_a_amount.checked_add(token_decimals)?;
                lamports
            }
            None => 0,
        };
        msg!("ApplySell, sol_lamports: {}", sol_lamports);

        let price_per_token: f64 = if sol_lamports > 0 {
            (self.pool_sol_lamports as f64) / (self.pool_a_amount as f64)
        } else {
            0.0
        };
        msg!("ApplySell, price_per_token: {}", price_per_token);
        Some(SellResult {
            token_decimals,
            sol_lamports,
            price_per_token,
        })
    }

    pub fn get_tokens_for_buy_sol(&self, sol_lamports: u64) -> Option<u64> {
        if sol_lamports == 0 {
            return None;
        }
        msg!("GetTokensForBuySol sol_lamports: {}", sol_lamports);

        let product = (self.pool_a_amount as u128).checked_mul(self.pool_sol_lamports as u128)?;
        msg!("GetTokensForBuySol k: {}", product);

        let new_sol_lamports = self.pool_sol_lamports.checked_add(sol_lamports)?;
        msg!("GetTokensForBuySol new sol lamports: {}", new_sol_lamports);

        let new_a_amount = product.checked_div(new_sol_lamports as u128)?;
        msg!("GetTokensForBuySol new a amount: {}", new_a_amount);

        let token_to_user = self.pool_a_amount.checked_sub(new_a_amount as u64)?;
        msg!("GetTokensForBuySol a to user: {}", token_to_user);

        Some(token_to_user)
    }

    pub fn get_sol_for_buy_token(&self, token_decimals: u64) -> Option<u64> {
        if token_decimals == 0 {
            return None;
        }
        msg!("GetSolForBuyToken token_decimals: {}", token_decimals);

        let product = (self.pool_a_amount as u128).checked_mul(self.pool_sol_lamports as u128)?;
        msg!("GetSolForBuyToken k: {}", product);

        let new_token_decimals = self.pool_a_amount.checked_add(token_decimals)?;
        msg!(
            "GetSolForBuyToken new_token_decimals: {}",
            new_token_decimals
        );

        let new_sol_lamports = product.checked_div(new_token_decimals as u128)?;
        msg!("GetSolForBuyToken new_sol_lamports: {}", new_sol_lamports);

        let sol_to_user = self
            .pool_sol_lamports
            .checked_sub(new_sol_lamports as u64)?;
        msg!("GetSolForBuyToken sol_to_user: {}", sol_to_user);

        Some(sol_to_user)
    }
}
