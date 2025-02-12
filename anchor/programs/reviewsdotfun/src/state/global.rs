use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Global {
    pub initialized: bool,
    pub authority: Pubkey,
    pub fee_vault: Pubkey,
    pub initial_virtual_token_reserves: u64,
    pub initial_virtual_sol_reserves: u64,
    pub initial_real_token_reserves: u64,
    pub reward_reserves: u64,
    pub token_supply: u64,
    pub fee_basis_pt: u8,
    pub bump: u8,
}
