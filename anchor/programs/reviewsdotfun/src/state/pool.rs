use crate::{error::*, errors::ReviewFunError};
use anchor_lang::prelude::*;
use fixed::types::I64F64;

#[account]
#[derive(Default, InitSpace)]
pub struct Pool {
    pub mint_a: Pubkey,
    pub pool_sol_amount: u64,
    pub pool_a_amount: u64,
    pub reward_a_amount: u64,
    pub k: u64,
    pub fee: u8,
    pub bump: u8,
}

impl Pool {
    pub fn calculate(
        &self,
        buy_a: bool,
        amount: u64,
        fee: u8,
    ) -> std::result::Result<u64, ReviewFunError> {
        let dy = match buy_a {
            true => self.pool_sol_amount,
            false => self.pool_a_amount,
        };
        let taxed_input = amount - amount * fee as u64 / 10000;
        let output = I64F64::from_num(taxed_input)
            .checked_mul(I64F64::from_num(dy))
            .unwrap()
            .checked_div(
                I64F64::from_num(dy)
                    .checked_add(I64F64::from_num(taxed_input))
                    .unwrap(),
            )
            .unwrap()
            .to_num::<u64>();

        Ok(output)
    }
}
