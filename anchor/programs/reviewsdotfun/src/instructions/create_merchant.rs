use anchor_lang::prelude::*;

//use crate::errors::*;
use crate::state::*;

#[derive(Accounts)]
pub struct CreateMerchant<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
      init, 
      space=8+Merchant::INIT_SPACE,
      payer=creator,
      seeds=[b"merchant_pda", creator.key().as_ref()], 
      bump
    )]
    pub merchant_pda: Account<'info, Merchant>,

    pub system_program: Program<'info, System>,
}

impl CreateMerchant<'_> {
    fn validate(&self) -> Result<()> {
        todo!()
    }

    #[access_control(ctx.accounts.validate())]
    pub fn create_merchant(ctx: Context<Self>) -> Result<()> {
        Ok(())
    }
}
