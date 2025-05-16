#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;
pub use constant::*;
pub use instructions::*;
pub use state::*;

pub mod constant;
pub mod errors;
pub mod instructions;
pub mod state;

declare_id!("FriAJA7uFN9zTeDcLZ91jxEXVHavYBa4UXddBUxGf5Vw");

#[program]
pub mod reviewsdotfun {
    use super::*;
    pub fn init_global(ctx: Context<InitGlobal>, args: InitGlobalArgs) -> Result<()> {
        InitGlobal::init_global(ctx, args)
    }
    pub fn create_mint(ctx: Context<CreateMint>, args: CreateMintArgs) -> Result<()> {
        CreateMint::create_mint(ctx, args)
    }
    pub fn mint_token(ctx: Context<MintToken>, args: MintTokenArgs) -> Result<()> {
        MintToken::mint_token(ctx, args)
    }
    pub fn create_pool(ctx: Context<CreatePool>, args: CreatePoolArgs) -> Result<()> {
        CreatePool::create_pool(ctx, args)
    }
    pub fn trade(ctx: Context<Trade>, args: TradeArgs) -> Result<()> {
        Trade::trade(ctx, args)
    }

    pub fn send_reward(ctx: Context<SendReward>) -> Result<()> {
        SendReward::send_reward(ctx)
    }

    pub fn wrap_sol(ctx: Context<WrapSol>) -> Result<()> {
        WrapSol::wrap_sol(ctx)
    }
}
