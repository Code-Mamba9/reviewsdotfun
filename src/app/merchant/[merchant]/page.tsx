"use client";
import { useState, useEffect } from "react";
import { ChartComponent } from "@/components/TradingViewChart";
import { ReviewSection } from "@/components/Reviewsection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { Merchant } from "@/types/db";
import { PublicKey } from "@solana/web3.js";
import { useReviewsdotfunProgram } from "@/components/reviewsdotfun/reviewsdotfun-data-access";
import Image from "next/image";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

const quickAmounts = [
  { label: "Reset", value: "" },
  { label: "1 SOL", value: "1" },
  { label: "5 SOL", value: "5" },
  { label: "10 SOL", value: "10" },
];

const chartData = [
  { time: "2023-01-01", open: 10, high: 12, low: 9, close: 11 },
  { time: "2023-01-02", open: 11, high: 13, low: 10, close: 12 },
];

interface MerchantPageProps {
  params: {
    merchant: string;
  };
}

export default function TradePage({ params }: MerchantPageProps) {
  const [solAmount, setSolAmount] = useState("");
  const [merchantData, setMerchantData] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokenMintAddress, setTokenMintAddress] = useState<string | null>(null);
  const { merchant } = params;
  const { programId } = useReviewsdotfunProgram();
  
  // Function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  
  // Format address to show only first and last few characters
  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch merchant data from Supabase
        const { data, error } = await supabase
          .from("Merchant")
          .select("*")
          .eq("merchant_wallet_addr", merchant)
          .single();

        if (error) {
          console.error("Error fetching merchant data:", error.message);
          return;
        }

        if (!data) {
          console.error("No merchant found with address:", merchant);
          return;
        }

        setMerchantData(data);

        // Calculate token mint address
        try {
          const merchantPublicKey = new PublicKey(merchant);
          const [mintAddress] = await PublicKey.findProgramAddress(
            [Buffer.from("mint"), merchantPublicKey.toBuffer()],
            programId
          );
          setTokenMintAddress(mintAddress.toString());
        } catch (err) {
          console.error("Error calculating token mint address:", err);
        }
      } catch (err) {
        console.error("Error in merchant page:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchantData();
  }, [merchant, programId]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Loading merchant data...</p>
      </div>
    );
  }

  if (!merchantData) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p>Merchant not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pt-16 mx-20">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800">
          {merchantData.name}
        </h1>
        {merchantData.website_url && (
          <a href={merchantData.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            {merchantData.website_url}
          </a>
        )}
      </div>
      <div className="flex">
        <div className="w-2/3 pr-8 pt-4">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Token Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                {merchantData.token_pic ? (
                  <Image 
                    src={merchantData.token_pic} 
                    alt={`${merchantData.token_name} token`} 
                    width={64} 
                    height={64} 
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xl font-bold">
                      {merchantData.token_name?.charAt(0) || "T"}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold">{merchantData.token_name}</h3>
                  {tokenMintAddress && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        Mint: {formatAddress(tokenMintAddress)}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(tokenMintAddress)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <ChartComponent
            data={chartData}
            colors={{
              backgroundColor: "white",
              lineColor: "#2962FF",
              textColor: "black",
            }}
          />
        </div>
        <div className="w-1/3 pt-4">
          <Card className="p-2 py-4">
            <CardContent className="space-y-6">
              <div className="flex space-x-4 my-5">
                <Button variant="outline" className="w-1/2">
                  Buy
                </Button>
                <Button variant="destructive" className="w-1/2">
                  Sell
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  SOL Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter SOL amount"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    className="w-full pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 mr-2">SOL</span>
                    <div className="w-6 h-6 bg-gray-300 rounded-full">
                      {/* TODO: Placeholder for Solana logo */}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  {quickAmounts.map((amount) => (
                    <Badge
                      key={amount.label}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSolAmount(amount.value)}
                    >
                      {amount.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full">Execute Trade</Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="w-full px-8 mt-1">
        <ReviewSection />
      </div>
    </div>
  );
}
