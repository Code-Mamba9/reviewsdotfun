use anchor_lang::prelude::*;
use fixed::types::I64F64;

#[account]
#[derive(Default, InitSpace)]
pub struct Pool {
    pub mint_a: Pubkey,
    pub sol_amount: u64,
    pub a_amount: u64,
    pub k: u64,
    pub bump: u8,
}

impl Pool {
    pub fn buy(&self, amount: u64, fee: u8) -> Option<u64> {}

    fn calculate(&self, is_sol: bool, amount: u64, fee: u8) -> Option<u64> {
        let dy = match is_sol {
            true => self.a_amount,
            false => self.sol_amount,
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
