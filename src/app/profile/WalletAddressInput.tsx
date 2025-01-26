import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, AlertCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WalletAddressInputProps {
  addresses: string[];
  setAddresses: React.Dispatch<React.SetStateAction<string[]>>;
  isValidAddress: (address: string) => boolean;
}

export function WalletAddressInput({
  addresses,
  setAddresses,
  isValidAddress,
}: WalletAddressInputProps) {
  const [errors, setErrors] = useState<string[]>(addresses.map(() => ""));

  const addAddress = () => {
    setAddresses([...addresses, ""]);
    setErrors([...errors, ""]);
  };

  const removeAddress = (index: number) => {
    setAddresses(addresses.filter((_, i) => i !== index));
    setErrors(errors.filter((_, i) => i !== index));
  };

  const updateAddress = (index: number, value: string) => {
    const newAddresses = [...addresses];
    newAddresses[index] = value;
    setAddresses(newAddresses);

    const newErrors = [...errors];
    newErrors[index] = isValidAddress(value) ? "" : "Invalid wallet address";
    setErrors(newErrors);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Recipient Wallet Addresses</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className="text-sm text-gray-500">ⓘ</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>The wallet addresses used to receive payments</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {addresses.map((address, index) => (
        <div key={index} className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Input
                value={address}
                onChange={(e) => updateAddress(index, e.target.value)}
                placeholder="Enter wallet address"
                required
                className={`pr-8 ${errors[index] ? "border-red-500 focus:ring-red-500" : ""}`}
                aria-invalid={errors[index] ? "true" : "false"}
                aria-describedby={errors[index] ? `error-${index}` : undefined}
              />
              {errors[index] && (
                <AlertCircle className="absolute right-2 top-1/2 transform -translate-y-1/2 text-red-500 h-5 w-5" />
              )}
            </div>
            {index > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAddress(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {errors[index] && (
            <p
              id={`error-${index}`}
              className="text-xs text-red-500"
              role="alert"
            >
              {errors[index]}
            </p>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={addAddress}
        className="w-full"
      >
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Address
      </Button>
    </div>
  );
}
