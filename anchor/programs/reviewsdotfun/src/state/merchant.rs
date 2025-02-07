use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::*;

#[account]
#[derive(InitSpace)]
pub struct Merchant {
    #[max_len(20)]
    pub name: String,
    pub bump: u8,
    pub owner: Pubkey,
}
