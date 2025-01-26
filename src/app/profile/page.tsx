"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletAddressInput } from "./WalletAddressInput";
import { WarningModal } from "./WarningModal";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { PublicKey } from "@solana/web3.js";

export default function CreateMerchantProfile() {
  const [showModal, setShowModal] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [walletAddresses, setWalletAddresses] = useState([""]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const isValidWalletAddress = (address: string) => {
    if (!address) return true;
    try {
      const walletAddress = new PublicKey(address);
      return PublicKey.isOnCurve(walletAddress);
    } catch {
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePicture) {
      alert("Please upload a profile picture.");
      return;
    }
    if (!walletAddresses.every(isValidWalletAddress)) {
      alert("Please enter valid wallet addresses.");
      return;
    }
    // TODO: Need a DB to store merchant info
    console.log({
      companyName,
      companyWebsite,
      walletAddresses,
      profilePicture,
    });
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
          />

          <div>
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="companyWebsite">Company Website URL</Label>
            <Input
              id="companyWebsite"
              type="url"
              value={companyWebsite}
              onChange={(e) => setCompanyWebsite(e.target.value)}
              required
            />
          </div>

          <WalletAddressInput
            addresses={walletAddresses}
            setAddresses={setWalletAddresses}
            isValidAddress={isValidWalletAddress}
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
}
