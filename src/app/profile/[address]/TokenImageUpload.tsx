import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TokenImageUploadProps {
  tokenImage: File | null;
  setTokenImage: (file: File | null) => void;
  profilePicture: File | null;
  currentTokenImageUrl?: string;
}

export function TokenImageUpload({
  tokenImage,
  setTokenImage,
  profilePicture,
  currentTokenImageUrl,
}: TokenImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentTokenImageUrl || null,
  );

  useEffect(() => {
    if (currentTokenImageUrl) {
      setPreviewUrl(currentTokenImageUrl);
    }
  }, [currentTokenImageUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTokenImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const useProfilePicture = () => {
    if (profilePicture) {
      setTokenImage(profilePicture);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(profilePicture);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="tokenImage">Token Image (Optional)</Label>
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={previewUrl || undefined}
            alt="Token image preview"
          />
          <AvatarFallback>TI</AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Input
            id="tokenImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="max-w-[220px]"
          />
          <Button
            type="button"
            variant="outline"
            onClick={useProfilePicture}
            className="w-full"
            disabled={!profilePicture}
          >
            Same as Profile Pic
          </Button>
        </div>
      </div>
    </div>
  );
}
