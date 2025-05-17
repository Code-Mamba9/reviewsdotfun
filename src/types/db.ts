export interface Merchant {
  merchant_wallet_addr: string;
  name: string;
  website_url: string;
  profile_pic: string | null;
  token_name: string;
  token_pic: string | null;
  token_mint: string | null;
  token_decimals?: number; // Optional token decimals property
  created_at: string | null;
}
