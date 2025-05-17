import { create } from "zustand";
import type { Merchant } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { PublicKey } from "@solana/web3.js";
import { isValidWalletAddress } from "@/utils/wallet";
import { uploadFileToStorage } from "@/utils/supabaseStorage";

interface MerchantStore {
  merchant: Merchant | null;
  isEditing: boolean;
  isCreating: boolean;
  companyName: string;
  companyWebsite: string;
  walletAddresses: string[];
  profilePicture: File | null;
  tokenTicker: string;
  tokenImage: File | null;
  tokenMint: string | null;
  setMerchant: (merchant: Merchant) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsCreating: (isCreating: boolean) => void;
  setCompanyName: (name: string) => void;
  setCompanyWebsite: (url: string) => void;
  setWalletAddresses: (addresses: string[]) => void;
  setProfilePicture: (file: File | null) => void;
  setTokenTicker: (ticker: string) => void;
  setTokenImage: (file: File | null) => void;
  setTokenMint: (mint: string | null) => void;
  resetForm: () => void;
  updateMerchant: () => Promise<void>;
  createMerchant: () => Promise<void>;
}

const useMerchantStore = create<MerchantStore>((set, get) => ({
  merchant: null,
  isEditing: false,
  isCreating: false,
  companyName: "",
  companyWebsite: "",
  walletAddresses: [],
  profilePicture: null,
  tokenTicker: "",
  tokenImage: null,
  tokenMint: null,

  setMerchant: (merchant) =>
    set({
      merchant,
      companyName: merchant.name,
      companyWebsite: merchant.website_url,
      walletAddresses: [merchant.merchant_wallet_addr],
      tokenTicker: merchant.token_name,
      tokenMint: merchant.token_mint
    }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setIsCreating: (isCreating) => set({ isCreating }),
  setCompanyName: (name) => set({ companyName: name }),
  setCompanyWebsite: (url) => set({ companyWebsite: url }),
  setWalletAddresses: (addresses) => set({ walletAddresses: addresses }),
  setProfilePicture: (file) => set({ profilePicture: file }),
  setTokenTicker: (ticker) => set({ tokenTicker: ticker }),
  setTokenImage: (file) => set({ tokenImage: file }),
  setTokenMint: (mint) => set({ tokenMint: mint }),

  resetForm: () =>
    set({
      companyName: "",
      companyWebsite: "",
      walletAddresses: [],
      profilePicture: null,
      tokenTicker: "",
      tokenImage: null,
    }),

  updateMerchant: async () => {
    const {
      merchant,
      companyName,
      companyWebsite,
      walletAddresses,
      profilePicture,
      tokenTicker,
      tokenImage,
      tokenMint,
    } = get();

    if (!merchant) return;

    if (!walletAddresses.every(isValidWalletAddress)) {
      throw new Error("Please enter valid wallet addresses.");
    }

    // let updatedProfilePicUrl = merchant.profile_pic;
    // let updatedTokenPicUrl = merchant.token_pic;

    // if (profilePicture) {
    //   try {
    //     updatedProfilePicUrl = await uploadFileToStorage(profilePicture, 'profile');
    //   } catch (err) {
    //     console.error('Error uploading profile picture:', err);
    //     throw new Error(`Failed to upload profile picture: ${err instanceof Error ? err.message : 'Unknown error'}`);
    //   }
    // }

    // if (tokenImage) {
    //   try {
    //     updatedTokenPicUrl = await uploadFileToStorage(tokenImage, 'token');
    //   } catch (err) {
    //     console.error('Error uploading token image:', err);
    //     throw new Error(`Failed to upload token image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    //   }
    // }

    const { error } = await supabase
      .from("Merchant")
      .update({
        merchant_wallet_addr: walletAddresses[0],
        name: companyName,
        profile_pic: null,
        token_name: tokenTicker,
        token_pic: null,
        website_url: companyWebsite,
        token_mint: tokenMint,
      })
      .eq("merchant_wallet_addr", merchant.merchant_wallet_addr);

    if (error) {
      throw error;
    }

    set({
      merchant: {
        ...merchant,
        merchant_wallet_addr: walletAddresses[0],
        name: companyName,
        profile_pic: null,
        token_name: tokenTicker,
        token_pic: null,
        website_url: companyWebsite,
        token_mint: tokenMint,
      },
      isEditing: false,
    });
  },

  createMerchant: async () => {
    const {
      companyName,
      companyWebsite,
      walletAddresses,
      profilePicture,
      tokenTicker,
      tokenImage,
    } = get();

    const isValidWalletAddress = (address: string) => {
      if (!address) return true;
      try {
        const walletAddress = new PublicKey(address);
        return PublicKey.isOnCurve(walletAddress);
      } catch {
        return false;
      }
    };

    if (!walletAddresses.every(isValidWalletAddress)) {
      throw new Error("Please enter valid wallet addresses.");
    }

    if (!profilePicture) {
      throw new Error("Please upload a profile picture.");
    }

    // let profilePicUrl;
    // try {
    //   profilePicUrl = await uploadFileToStorage(profilePicture, 'profile');
    // } catch (err) {
    //   console.error('Error uploading profile picture during creation:', err);
    //   throw new Error(`Failed to upload profile picture: ${err instanceof Error ? err.message : 'Unknown error'}`);
    // }

    // let tokenPicUrl = null;
    // if (tokenImage) {
    //   try {
    //     tokenPicUrl = await uploadFileToStorage(tokenImage, 'token');
    //   } catch (err) {
    //     console.error('Error uploading token image during creation:', err);
    //     throw new Error(`Failed to upload token image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    //   }
    // }


    const { data, error } = await supabase
      .from("Merchant")
      .insert({
        created_at: new Date().toISOString(),
        merchant_wallet_addr: walletAddresses[0],
        name: companyName,
        profile_pic: null,
        token_name: tokenTicker,
        token_pic: null,
        website_url: companyWebsite,
        token_mint: null,
      })
      .select();

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      set({
        merchant: data[0] as Merchant,
        isCreating: false,
      });
    }
  },
}));

export default useMerchantStore;
