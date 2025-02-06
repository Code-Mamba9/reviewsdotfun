"use client";

import type React from "react";
import { useEffect, useState, FC, FormEvent } from "react";
import useMerchantStore from "@/store/useMerchantStore";
import type { Merchant } from "@/types";
import { MerchantForm } from "@/components/profile/MerchantForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";

interface EditPageProps {
  initialMerchant: Merchant;
}

const EditPage: FC<EditPageProps> = ({ initialMerchant }) => {
  const [isEditing, setIsEditing] = useState(false);
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
  } = useMerchantStore();

  useEffect(() => {
    setMerchant(initialMerchant);
  }, [initialMerchant, setMerchant]);

  if (!merchant) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await updateMerchant();
      alert("Merchant profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      alert(`Error updating profile: ${error}`);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const MerchantInfo = () => (
    <motion.div
      initial={{ width: "100%", opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      exit={{ width: "100%", opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Merchant Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src={merchant.profile_pic || undefined}
                alt={merchant.name}
              />
              <AvatarFallback>{merchant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{merchant.name}</h2>
              <a
                href={merchant.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                {merchant.website_url}
              </a>
            </div>
          </div>
          <div>
            <h3 className="font-semibold">Token</h3>
            <p>{merchant.token_name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Wallet Address</h3>
            <p className="break-all">{merchant.merchant_wallet_addr}</p>
          </div>
          <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const EditForm = () => (
    <motion.div
      initial={{ width: "100%", opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      exit={{ width: "100%", opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Edit Merchant Profile</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </motion.div>
  );
  const Stats = () => {
    return (
      <div className="lg:w-1/2 flex items-center justify-center mt-12">
        <div className="text-center font-menlo space-y-12">
          <p className="mb-8">
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold">
              20
            </span>
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl ml-2">
              Reviews
            </span>
          </p>
          <p>
            <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold">
              20
            </span>
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl ml-2">
              $SOL MktCap
            </span>
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="container mx-auto px-4">
        <motion.div
          layout
          className="flex flex-col lg:flex-row lg:space-x-8 items-start"
          transition={{ duration: 0.3 }}
        >
          <motion.div
            layout
            className="lg:w-1/2 mb-8 lg:mb-0"
            transition={{ duration: 0.3 }}
          >
            <AnimatePresence mode="wait">
              {isEditing ? (
                <EditForm key="edit" />
              ) : (
                <MerchantInfo key="info" />
              )}
            </AnimatePresence>
          </motion.div>
          <Stats />
        </motion.div>
      </div>
    </div>
  );
};

export default EditPage;
