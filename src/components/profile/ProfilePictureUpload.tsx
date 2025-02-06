import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfilePictureUploadProps {
  setProfilePicture: (file: File | null) => void;
  currentProfilePicUrl?: string;
  required?: boolean;
}

export function ProfilePictureUpload({
  setProfilePicture,
  currentProfilePicUrl,
  required = false,
}: ProfilePictureUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentProfilePicUrl || null,
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="profilePicture">
        Profile Picture
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex items-center space-x-4">
        <Avatar className="w-20 h-20">
          <AvatarImage
            src={previewUrl || undefined}
            alt="Profile picture preview"
          />
          <AvatarFallback>Picture</AvatarFallback>
        </Avatar>
        <Input
          id="profilePicture"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="max-w-[220px]"
          required={required}
        />
      </div>
    </div>
  );
}
