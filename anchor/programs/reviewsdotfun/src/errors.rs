use anchor_lang::prelude::*;

#[error_code]
pub enum ReviewFunError {
    #[msg("Pool runs out of reserve")]
    InsufficientBalance,

    #[msg("Account doesnt have enough SOL")]
    InsufficientLamports,

    #[msg("Pool calculation Error")]
    CalculationError,

    #[msg("Input amount too big")]
    OverFlowU64,
}
