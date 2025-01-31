"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletAddressInput } from "./WalletAddressInput";
import { WarningModal } from "./WarningModal";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { TokenImageUpload } from "./TokenImageUpload";
import { supabase } from "@/lib/supabaseClient";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

const requiredFieldIndicator = <span className="text-red-500 ml-1">*</span>;

export default function CreateMerchantProfile() {
  const { publicKey } = useWallet();

  const [showModal, setShowModal] = useState(true);
  const [companyName, setCompanyName] = useState("");
  const [companyWebsite, setCompanyWebsite] = useState("");
  const [walletAddresses, setWalletAddresses] = useState([
    publicKey?.toString(),
  ]);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [tokenTicker, setTokenTicker] = useState("");
  const [tokenImage, setTokenImage] = useState<File | null>(null);

  useEffect(() => {
    if (publicKey) {
      setWalletAddresses([publicKey.toString()]);
    }
  }, [publicKey]);

  const isValidWalletAddress = (address: string) => {
    if (!address) return true;
    try {
      const walletAddress = new PublicKey(address);
      return PublicKey.isOnCurve(walletAddress);
    } catch {
      return false;
    }
  };

  const uploadImage = async (file: File, path: string) => {
    const { data } = await supabase.from("Merchants").select("");
    console.log(data);
    const { error } = await supabase.storage
      .from("merchant-profile-dev")
      .upload(path, file);

    if (error) throw error;
    const { data: publickUrlData } = supabase.storage
      .from("merchant-profile-dev")
      .getPublicUrl(path);

    return publickUrlData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profilePicture) {
      alert("Please upload a profile picture.");
      return;
    }
    if (!walletAddresses.every(isValidWalletAddress)) {
      alert("Please enter valid wallet addresses.");
      return;
    }

    const profilePicPath = `profile-${companyName}-${profilePicture.name}`;
    const tokenPicPath = tokenImage
      ? `token-${companyName}-${tokenImage.name}`
      : null;

    const profilePicUrl = await uploadImage(profilePicture, profilePicPath);
    const tokenPicUrl =
      tokenPicPath && tokenImage
        ? await uploadImage(tokenImage, tokenPicPath)
        : null;
    console.log(tokenPicUrl, profilePicUrl);

    const { error } = await supabase.from("Merchants").insert({
      created_at: Date.now(),
      merchant_wallet_addr: walletAddresses[0],
      name: companyName,
      profile_pic: profilePicUrl,
      token_name: tokenTicker,
      token_pic: tokenPicUrl,
      website_url: companyWebsite,
    });

    if (error) {
      throw error;
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
}
