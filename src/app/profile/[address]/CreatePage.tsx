"use client";

import type React from "react";
import { useEffect, useState, FC, FormEvent } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { PublicKey } from "@solana/web3.js";
import { WarningModal } from "./WarningModal";
import useMerchantStore from "@/store/useMerchantStore";
import { MerchantForm } from "@/components/profile/MerchantForm";
import { useReviewsdotfunProgram } from "@/components/reviewsdotfun/reviewsdotfun-data-access";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

const CreatePage: FC = () => {
  const { publicKey } = useWallet();
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();
  const { createMint, createPool, mintToken, program } = useReviewsdotfunProgram();

  const {
    companyName,
    companyWebsite,
    walletAddresses,
    profilePicture,
    tokenTicker,
    tokenImage,
    setCompanyName,
    setCompanyWebsite,
    setWalletAddresses,
    setProfilePicture,
    setTokenTicker,
    setTokenImage,
    setTokenMint,
    createMerchant,
    resetForm,
  } = useMerchantStore();

  useEffect(() => {
    if (publicKey) {
      setWalletAddresses([publicKey.toString()]);
    }
  }, [publicKey, setWalletAddresses]);

  useEffect(() => {
    // Reset the form when the component mounts
    resetForm();
  }, [resetForm]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      toast.error("Wallet not connected");
      return;
    }

    try {
      // Step 1: Create merchant profile in Supabase
      await createMerchant();
      const { merchant } = useMerchantStore.getState();
      
      // Step 2: Create token mint on Solana
      try {
        // Calculate the mint address using the same derivation as in createMint
        console.log("Mint Not yet created");
        // Create the mint
        await createMint.mutateAsync({
          name: tokenTicker,
          symbol: tokenTicker,
          uri: "https://reviewsdotfun.com/token",
          decimals: 6,
          merchantKey: publicKey,
        });
        
        // Step 3: Create token pool
        await createPool.mutateAsync({ merchantKey: publicKey });
        
      //   // Step 4: Mint initial tokens
        await mintToken.mutateAsync(publicKey);
        
        console.log("Before finding Mint PDA")
      //   // Step 5: Update the token_mint field in Supabase
        const [mintAddress] = await PublicKey.findProgramAddress(
          [Buffer.from("mint"), publicKey.toBuffer()],
          program.programId
        );
        console.log(mintAddress)
        
        if (merchant) {
          const { error: updateError } = await supabase
            .from("Merchant")
            .update({ token_mint: mintAddress.toString() })
            .eq("merchant_wallet_addr", merchant.merchant_wallet_addr);
          
          if (updateError) {
            console.error("Error updating token_mint in Supabase:", updateError);
            toast.error(`Failed to update token mint: ${updateError.message}`);
          } else {
            // Update the local store with the token_mint value
            setTokenMint(mintAddress.toString());
            toast.success("Merchant profile and token created successfully!");
          }
        }
      } catch (solanaError) {
        console.error("Error creating token on Solana:", solanaError);
        toast.error(`Token creation failed: ${solanaError instanceof Error ? solanaError.message : 'Unknown error'}`);
        // Continue with redirect even if token creation fails
      }
      
      // Redirect to the merchant admin page
      router.push(`/merchant-admin/${publicKey.toString()}`);
    } catch (error) {
      console.error("Error creating profile:", error);
      toast.error(`Error creating profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <WarningModal isOpen={showModal} onClose={() => setShowModal(false)} />

        <h1 className="text-2xl font-bold text-center">
          Create Merchant Profile
        </h1>

        <MerchantForm
          merchant={null}
          companyName={companyName}
          companyWebsite={companyWebsite}
          walletAddresses={walletAddresses}
          profilePicture={profilePicture}
          tokenTicker={tokenTicker}
          tokenImage={tokenImage}
          setCompanyName={setCompanyName}
          setCompanyWebsite={setCompanyWebsite}
          setWalletAddresses={setWalletAddresses}
          setProfilePicture={setProfilePicture}
          setTokenTicker={setTokenTicker}
          setTokenImage={setTokenImage}
          setTokenMint={setTokenMint}
          onSubmit={handleSubmit}
          submitButtonText="Submit"
        />
      </div>
    </div>
  );
};

export default CreatePage;
