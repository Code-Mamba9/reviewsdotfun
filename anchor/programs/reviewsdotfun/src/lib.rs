#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
pub use instructions::*;
pub use state::*;

pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod reviewsdotfun {
    use super::*;
    pub fn create_merchant(ctx: Context<CreateMerchant>) -> Result<()> {
        CreateMerchant::create_merchant(ctx)
    }
    pub fn create_mint(ctx: Context<CreateMint>, args: CreateMintArgs) -> Result<()> {
        CreateMint::create_mint(ctx, args)
    }
}
