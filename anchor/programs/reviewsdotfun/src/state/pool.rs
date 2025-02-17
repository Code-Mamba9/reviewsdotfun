use anchor_lang::prelude::*;

#[account]
#[derive(Default, InitSpace)]
pub struct Pool {
    pub mint_a: Pubkey,
    pub virtual_sol_amount: u64,
    pub virtual_a_amount: u64,
}

impl Pool {
    pub fn swap(is_sol: bool, amount: u64) -> Option<u64> {
        None
    }
}
