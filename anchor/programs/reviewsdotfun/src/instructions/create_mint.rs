use anchor_spl::token_interface::{Mint, TokenInterface};
use anchor_lang::prelude::*;
use anchor_spl::metadata::{
  create_metadata_accounts_v3,
  mpl_token_metadata::types::DataV2,
  CreateMetadataAccountsV3, 
  Metadata
};
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateMintArgs {
  pub name: String,
  pub symbol: String,
  pub uri: String,
  pub decimals: u8,
}

#[derive(Accounts)]
#[instruction(args: CreateMintArgs)]
pub struct CreateMint<'info> { 
    #[account(mut)]
    pub signer: Signer<'info>, // merchant signer

    /// CHECK: mint key, program key and metaplex program id
    #[account(
      mut
    )]
    pub metadata: UncheckedAccount<'info>,

    #[account(
      init, 
      payer=signer,
      mint::decimals = 6,
      mint::authority = global_pda.key(),
      mint::freeze_authority = global_pda.key(),
      //mint::authority=signer,
      //mint::freeze_authority=signer,
      seeds=[b"mint", args.name.as_bytes()],
      bump
    )]
    pub mint: InterfaceAccount<'info, Mint>,

    #[account(
      mut,
      seeds=[b"global"],
      bump=global_pda.bump,
    )]
    pub global_pda: Account<'info, Global>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Interface<'info, TokenInterface>,
    pub token_metadata_program: Program<'info, Metadata>,
    pub system_program: Program<'info, System>,
}

impl CreateMint<'_> {
    //fn validate(&self) -> Result<()> {
    //    todo!()
    //}
    //
    //#[access_control(ctx.accounts.validate())]
    pub fn create_mint(ctx: Context<Self>, args: CreateMintArgs) -> Result<()> {
      msg!("Ready to init data!");
      let CreateMintArgs { name, symbol, uri, decimals } = args;
      //let seeds = &["mint".as_bytes(), name.as_bytes(), &[ctx.bumps.mint]];
      let global_bump = ctx.accounts.global_pda.bump;
      let seeds = &["global".as_bytes(), &[global_bump]];
      let signer = [&seeds[..]];


      let token_data: DataV2 = DataV2 {
        name: name.clone(),
        symbol,
        uri,
        seller_fee_basis_points: 10,
        creators: None,
        collection: None,
        uses: None,
      };

      msg!("Declared");
      let metadata_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_metadata_program.to_account_info(),
        CreateMetadataAccountsV3 {
          payer: ctx.accounts.signer.to_account_info(),
          update_authority: ctx.accounts.global_pda.to_account_info(),
          mint: ctx.accounts.mint.to_account_info(),
          metadata: ctx.accounts.metadata.to_account_info(),
          mint_authority: ctx.accounts.global_pda.to_account_info(),
          system_program: ctx.accounts.system_program.to_account_info(),
          rent: ctx.accounts.rent.to_account_info(),
        },
        &signer
      );
      msg!("Context ready");

      create_metadata_accounts_v3(
        metadata_ctx,
        token_data,
        false,
        true, // update authority is signer
        None,
      )?;

      msg!("Token create success!");

      Ok(())
    }
}
