use anchor_lang::prelude::*;
//use crate::errors::*;
use crate::state::*;

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
      ctx.accounts.global_pda.set_inner(
        Global {  // 75% available to trade, 8% review rewards, 17% merchant controlled
          initialized: false,
          authority: args.authority,
          fee_vault: args.fee_vault,
          initial_sol_reserve: 1_000_000_000,
          initial_token_a_reserves: 1_000_000_000,
          reward_reserves: 80_000_000,
          token_supply: 1_000_000_000,
          fee_basis_pt: 30,
          bump: ctx.bumps.global_pda,
        }
      );
      Ok(())
    }
}
