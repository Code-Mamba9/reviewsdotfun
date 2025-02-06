import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WalletAddressInput } from "./WalletAddressInput";
import { ProfilePictureUpload } from "./ProfilePictureUpload";
import { TokenImageUpload } from "./TokenImageUpload";
import type { Merchant } from "@/types";

const requiredFieldIndicator = <span className="text-red-500 ml-1">*</span>;

interface MerchantFormProps {
  merchant: Merchant | null;
  companyName: string;
  companyWebsite: string;
  walletAddresses: string[];
  profilePicture: File | null;
  tokenTicker: string;
  tokenImage: File | null;
  setCompanyName: (name: string) => void;
  setCompanyWebsite: (url: string) => void;
  setWalletAddresses: (addresses: string[]) => void;
  setProfilePicture: (file: File | null) => void;
  setTokenTicker: (ticker: string) => void;
  setTokenImage: (file: File | null) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  submitButtonText: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export function MerchantForm({
  merchant,
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
  onSubmit,
  submitButtonText,
  showCancelButton = false,
  onCancel,
}: MerchantFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <ProfilePictureUpload
        profilePicture={profilePicture}
        setProfilePicture={setProfilePicture}
        currentProfilePicUrl={merchant?.profile_pic}
        required={!merchant}
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
        currentTokenImageUrl={merchant?.token_pic}
      />

      <WalletAddressInput
        addresses={walletAddresses}
        setAddresses={setWalletAddresses}
        required={true}
      />

      <div className="flex space-x-4">
        <Button type="submit" className="flex-1">
          {submitButtonText}
        </Button>
        {showCancelButton && onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            className="flex-1"
            variant="outline"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
