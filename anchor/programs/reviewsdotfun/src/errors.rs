use anchor_lang::prelude::*;

#[error_code]
pub enum ReviewFunError {
    #[msg("Pool runs out of reserve")]
    InsufficientBalance,

    #[msg("Account doesnt have enough SOL")]
    InsufficientLamports,

    #[msg("Account doesnt have enough Token")]
    InsufficientDecimals,

    #[msg("At least 1 SOL to create a pool")]
    BootStrapError,

    #[msg("Pool calculation Error")]
    CalculationError,

    #[msg("Input amount too big")]
    OverFlowU64,

    #[msg("Failed to buy token")]
    BuyError,

    #[msg("Failed to sell SOL")]
    SellError,

    #[msg("Slippage Exceeded")]
    SlippageExceeded,
}
