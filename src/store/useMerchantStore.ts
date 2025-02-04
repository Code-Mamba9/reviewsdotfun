import { create } from "zustand";
import type { Merchant } from "@/types";
import { supabase } from "@/lib/supabaseClient";
import { PublicKey } from "@solana/web3.js";

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
  setMerchant: (merchant: Merchant) => void;
  setIsEditing: (isEditing: boolean) => void;
  setIsCreating: (isCreating: boolean) => void;
  setCompanyName: (name: string) => void;
  setCompanyWebsite: (url: string) => void;
  setWalletAddresses: (addresses: string[]) => void;
  setProfilePicture: (file: File | null) => void;
  setTokenTicker: (ticker: string) => void;
  setTokenImage: (file: File | null) => void;
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

  setMerchant: (merchant) =>
    set({
      merchant,
      companyName: merchant.name,
      companyWebsite: merchant.website_url,
      walletAddresses: [merchant.merchant_wallet_addr],
      tokenTicker: merchant.token_name,
    }),
  setIsEditing: (isEditing) => set({ isEditing }),
  setIsCreating: (isCreating) => set({ isCreating }),
  setCompanyName: (name) => set({ companyName: name }),
  setCompanyWebsite: (url) => set({ companyWebsite: url }),
  setWalletAddresses: (addresses) => set({ walletAddresses: addresses }),
  setProfilePicture: (file) => set({ profilePicture: file }),
  setTokenTicker: (ticker) => set({ tokenTicker: ticker }),
  setTokenImage: (file) => set({ tokenImage: file }),

  resetForm: () =>
    set({
      companyName: "",
      companyWebsite: "",
      walletAddresses: [],
      profilePicture: null,
      tokenTicker: "",
      tokenImage: null,
    }),
  isValidWalletAddress: (address: string) => {
    if (!address) return true;
    try {
      const walletAddress = new PublicKey(address);
      return PublicKey.isOnCurve(walletAddress);
    } catch {
      return false;
    }
  },

  updateMerchant: async () => {
    const {
      merchant,
      companyName,
      companyWebsite,
      walletAddresses,
      profilePicture,
      tokenTicker,
      tokenImage,
    } = get();

    if (!merchant) return;

    if (!walletAddresses.every(isValidWalletAddress)) {
      throw new Error("Please enter valid wallet addresses.");
    }

    const uploadImage = async (file: File, path: string) => {
      const { error } = await supabase.storage
        .from("merchant-profile-dev")
        .upload(path, file);

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from("merchant-profile-dev")
        .getPublicUrl(path);

      return publicUrlData.publicUrl;
    };

    let updatedProfilePicUrl = merchant.profile_pic;
    let updatedTokenPicUrl = merchant.token_pic;

    if (profilePicture) {
      const profilePicPath = `profile-${companyName}-${profilePicture.name}`;
      updatedProfilePicUrl = await uploadImage(profilePicture, profilePicPath);
    }

    if (tokenImage) {
      const tokenPicPath = `token-${companyName}-${tokenImage.name}`;
      updatedTokenPicUrl = await uploadImage(tokenImage, tokenPicPath);
    }

    const { error } = await supabase
      .from("Merchants")
      .update({
        merchant_wallet_addr: walletAddresses[0],
        name: companyName,
        profile_pic: updatedProfilePicUrl,
        token_name: tokenTicker,
        token_pic: updatedTokenPicUrl,
        website_url: companyWebsite,
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
        profile_pic: updatedProfilePicUrl,
        token_name: tokenTicker,
        token_pic: updatedTokenPicUrl,
        website_url: companyWebsite,
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

    const uploadImage = async (file: File, path: string) => {
      const { error } = await supabase.storage
        .from("merchant-profile-dev")
        .upload(path, file);

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from("merchant-profile-dev")
        .getPublicUrl(path);

      return publicUrlData.publicUrl;
    };

    const profilePicPath = `profile-${companyName}-${profilePicture.name}`;
    const profilePicUrl = await uploadImage(profilePicture, profilePicPath);

    let tokenPicUrl = null;
    if (tokenImage) {
      const tokenPicPath = `token-${companyName}-${tokenImage.name}`;
      tokenPicUrl = await uploadImage(tokenImage, tokenPicPath);
    }

    const { data, error } = await supabase
      .from("Merchants")
      .insert({
        created_at: new Date().toISOString(),
        merchant_wallet_addr: walletAddresses[0],
        name: companyName,
        profile_pic: profilePicUrl,
        token_name: tokenTicker,
        token_pic: tokenPicUrl,
        website_url: companyWebsite,
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
