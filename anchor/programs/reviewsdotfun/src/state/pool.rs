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
    pub bump: u8,
}

impl Pool {
    pub fn buy(&self, amount: u64, fee: u8) -> Option<u64> {
        self.calculate(false, amount, fee)
    }

    pub fn sell(&self, amount: u64, fee: u8) -> Option<u64> {
        self.calculate(true, amount, fee)
    }

    fn calculate(&self, is_sol: bool, amount: u64, fee: u8) -> Option<u64> {
        let dy = match is_sol {
            true => self.pool_a_amount,
            false => self.pool_sol_amount,
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

        Some(output)
    }
}
