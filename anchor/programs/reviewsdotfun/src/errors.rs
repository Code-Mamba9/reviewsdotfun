use anchor_lang::prelude::*;

#[error_code]
pub enum ReviewFunError {
    #[msg("Pool runs out of reserve")]
    InsufficientBalance,
}
