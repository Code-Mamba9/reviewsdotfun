use anchor_lang::prelude::*;
//use crate::errors::*;
use crate::state::*;
use crate::constant::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InitGlobalArgs {
  pub authority: Pubkey,
  pub fee_vault: Pubkey

}

#[derive(Accounts)]
pub struct InitGlobal<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
      init, 
      space=8+Global::INIT_SPACE,
      payer=payer,
      seeds=[b"global"],
      bump
    )]
    pub global_pda: Account<'info, Global>,
    pub system_program: Program<'info, System>,
}

impl InitGlobal<'_> {
    pub fn init_global(ctx: Context<Self>, args: InitGlobalArgs) -> Result<()> {
      msg!("Starting to init");
      ctx.accounts.global_pda.set_inner(
        Global {  // 75% available to trade, 8% review rewards, 17% merchant controlled
          initialized: false,
          authority: args.authority,
          fee_vault: args.fee_vault,
          initial_sol: SOL_BOOTSTRAP_LAMPORTS,
          token_trade_portion: TOKEN_TRADE_PORTION,
          token_reward_portion: TOKEN_REWARD_PORTION,
          token_reserve_portion: TOKEN_RESERVE_PORTION,
          token_supply: TOKEN_DECIMALS,
          reward_decimals: REWARD_DECIMALS,
          fee_basis_pt: FEE_BASIS_PT,
          bump: ctx.bumps.global_pda,
        }
      );
      msg!("Done to init");
      Ok(())
    }
}
