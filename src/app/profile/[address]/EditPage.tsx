"use client";

import type React from "react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletAddressInput } from "./WalletAddressInput";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { TokenImageUpload } from "./TokenImageUpload";
import useMerchantStore from "@/store/useMerchantStore";
import { PublicKey } from "@solana/web3.js";
import type { Merchant } from "@/types";

const requiredFieldIndicator = <span className="text-red-500 ml-1">*</span>;

interface EditPageProps {
  initialMerchant: Merchant;
}

const EditPage: React.FC<EditPageProps> = ({ initialMerchant }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

  const isValidWalletAddress = (address: string) => {
    if (!address) return true;
    try {
      const walletAddress = new PublicKey(address);
      return PublicKey.isOnCurve(walletAddress);
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen flex items-start justify-center bg-gray-50 pt-16">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Edit Merchant Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <ProfilePictureUpload
            profilePicture={profilePicture}
            setProfilePicture={setProfilePicture}
            currentProfilePicUrl={merchant.profile_pic}
            required={false}
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
            currentTokenImageUrl={merchant.token_pic}
          />

          <WalletAddressInput
            addresses={walletAddresses}
            setAddresses={setWalletAddresses}
            isValidAddress={isValidWalletAddress}
            required={true}
          />

          <div className="flex space-x-4">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>
            <Button
              type="button"
              onClick={handleCancel}
              className="flex-1"
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPage;
