"use client";

import type React from "react";
import { useEffect, useState, FC, FormEvent } from "react";
import { WarningModal } from "./WarningModal";
import { useWallet } from "@solana/wallet-adapter-react";
import useMerchantStore from "@/store/useMerchantStore";
import { MerchantForm } from "@/components/profile/MerchantForm";

const CreatePage: FC = () => {
  const { publicKey } = useWallet();
  const [showModal, setShowModal] = useState(true);

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
    try {
      await createMerchant();
      alert("Merchant profile created successfully!");
      // You might want to redirect the user or show a success message here
    } catch (error) {
      alert(`Error creating profile: ${error}`);
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
          onSubmit={handleSubmit}
          submitButtonText="Submit"
        />
      </div>
    </div>
  );
};

export default CreatePage;
