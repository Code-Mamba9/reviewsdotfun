use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Global {
    pub initialized: bool,
    pub authority: Pubkey,
    pub fee_vault: Pubkey,
    pub initial_sol: u64,
    pub token_trade_portion: f64,
    pub token_reward_portion: f64,
    pub token_reserve_portion: f64,
    pub token_supply: u64,
    pub reward_decimals: u64,
    pub fee_basis_pt: u8,
    pub bump: u8,
}
