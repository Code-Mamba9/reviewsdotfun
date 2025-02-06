"use client";

import type React from "react";
import { useEffect, FC, FormEvent } from "react";
import useMerchantStore from "@/store/useMerchantStore";
import type { Merchant } from "@/types";
import { MerchantForm } from "@/components/profile/MerchantForm";

interface EditPageProps {
  initialMerchant: Merchant;
}

const EditPage: FC<EditPageProps> = ({ initialMerchant }) => {
  const {
    merchant,
    companyName,
    companyWebsite,
    walletAddresses,
    profilePicture,
    tokenTicker,
    tokenImage,
    setMerchant,
    setCompanyName,
    setCompanyWebsite,
    setWalletAddresses,
    setProfilePicture,
    setTokenTicker,
    setTokenImage,
    updateMerchant,
    setIsEditing,
    resetForm,
  } = useMerchantStore();

  useEffect(() => {
    setMerchant(initialMerchant);
    setIsEditing(true);
  }, [initialMerchant, setMerchant, setIsEditing]);

  if (!merchant) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateMerchant();
      alert("Merchant profile updated successfully!");
    } catch (error) {
      alert(`Error updating profile: ${error}`);
    }
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Edit Merchant Profile
        </h1>

        <MerchantForm
          merchant={merchant}
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
          submitButtonText="Save Changes"
          showCancelButton={true}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default EditPage;
