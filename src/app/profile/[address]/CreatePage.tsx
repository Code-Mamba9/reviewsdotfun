"use client";

import type React from "react";
import { FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletAddressInput } from "./WalletAddressInput";
import { WarningModal } from "./WarningModal";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { TokenImageUpload } from "./TokenImageUpload";
import { useWallet } from "@solana/wallet-adapter-react";
import useMerchantStore from "@/store/useMerchantStore";
import { isValidWalletAddress } from "@/utils/wallet";

const requiredFieldIndicator = <span className="text-red-500 ml-1">*</span>;

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

  const handleSubmit = async (e: React.FormEvent) => {
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfilePictureUpload
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
            required={true}
          />

          <div>
            <Label htmlFor="companyName">
              Company Name{requiredFieldIndicator}
            </Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="companyWebsite">
              Company Website URL{requiredFieldIndicator}
            </Label>
            <Input
              id="companyWebsite"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="tokenTicker">
              Token Ticker{requiredFieldIndicator}
            </Label>
            <Input
              id="tokenTicker"
              value={tokenTicker}
              onChange={(e) => setTokenTicker(e.target.value.toUpperCase())}
              placeholder="SOL"
              maxLength={8}
              required
            />
            <p className="text-sm text-gray-500 mt-1">Max 8 characters</p>
          </div>

          <TokenImageUpload
            tokenImage={tokenImage}
            setTokenImage={setTokenImage}
            profilePicture={profilePicture}
          />

          <WalletAddressInput
            addresses={walletAddresses}
            setAddresses={setWalletAddresses}
            isValidAddress={isValidWalletAddress}
            required={true}
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CreatePage;
