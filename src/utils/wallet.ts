import { PublicKey } from "@solana/web3.js";

const isValidWalletAddress = (address: string) => {
  if (!address) return true;
  try {
    const walletAddress = new PublicKey(address);
    return PublicKey.isOnCurve(walletAddress);
  } catch {
    return false;
  }
};

export { isValidWalletAddress };
