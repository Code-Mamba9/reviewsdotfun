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
import { BN } from "bn.js";

// Define separate quick amounts for buying and selling
const buyQuickAmounts = [
  { label: "Reset", value: "" },
  { label: "1 SOL", value: "1" },
  { label: "5 SOL", value: "5" },
  { label: "10 SOL", value: "10" },
];

const sellQuickAmounts = [
  { label: "Reset", value: "" },
  { label: "10", value: "10" },
  { label: "50", value: "50" },
  { label: "100", value: "100" },
];

// Initial chart data structure
const initialChartData = [
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
  const [isBuying, setIsBuying] = useState(true); // Track whether user is buying or selling
  const [chartData, setChartData] = useState(initialChartData); // State for chart data
  const { merchant } = params;
  const { program, programId, trade } = useReviewsdotfunProgram();
  
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

  // Handle trade execution
  const handleTrade = async () => {
    if (!solAmount || !merchant || !merchantData) {
      toast.error(`Please enter a valid ${isBuying ? "SOL" : merchantData?.token_name || "token"} amount`);
      return;
    }

    try {
      // Get the merchant public key
      const merchantKey = new PublicKey(merchant);
      
      // Get the fee vault from environment variable or use a default
      const feeVaultAddress = process.env.NEXT_PUBLIC_FEE_VAULT || merchantKey.toString();
      const feeVault = new PublicKey(feeVaultAddress);
      
      let amount;
      if (isBuying) {
        amount = new BN(parseFloat(solAmount) * 1_000_000_000);
      } else {
        amount = new BN(parseFloat(solAmount) * Math.pow(10, 6));
      }
      
      // Execute the trade
      await trade.mutateAsync({
        amount,
        buy: isBuying,
        feeVault,
        merchantKey
      });
      
      // Reset the amount input after successful trade
      setSolAmount("");
      toast.success(`Successfully ${isBuying ? "bought" : "sold"} ${merchantData.token_name || "tokens"}`);
      
      // Calculate the current token price
      let mint = new PublicKey(tokenMintAddress!);

      const [pool] = await PublicKey.findProgramAddress(
        [Buffer.from("pool"), mint.toBuffer()],
        programId
      );

      const poolAccount = await program.account.pool.fetch(pool);
      
      // Calculate token price and convert BN to number for chart data
      const priceInBN = poolAccount.poolSolLamports.div(poolAccount.poolAAmount);
      const priceOfToken = priceInBN.toNumber() / 1000; // Convert BN to number and adjust
      // Add the new price data point to the chart
      const currentDate = new Date();
      const formattedTime = currentDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      
      // Create a new data point
      const newDataPoint = {
        time: formattedTime,
        open: priceOfToken,
        high: priceOfToken * 1.01, // Slightly higher for visualization
        low: priceOfToken * 0.99,  // Slightly lower for visualization
        close: priceOfToken
      };
      
      // Update the chart data with the new point
      setChartData(prevData => {
        // Check if we already have a data point for today
        const existingPointIndex = prevData.findIndex(point => point.time === formattedTime);
        
        if (existingPointIndex >= 0) {
          // Update existing point for today
          const updatedData = [...prevData];
          updatedData[existingPointIndex] = newDataPoint;
          return updatedData;
        } else {
          // Add new point
          return [...prevData, newDataPoint];
        }
      });


    } catch (error) {
      console.error("Trade error:", error);
      toast.error(`Failed to ${isBuying ? "buy" : "sell"} ${merchantData.token_name || "tokens"}: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
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
              lineColor: "#00FF88", // Updated to match the green theme
              textColor: "black",
            }}
          />
        </div>
        <div className="w-1/3 pt-4">
          <Card className="p-2 py-4">
            <CardContent className="space-y-6">
              <div className="flex space-x-4 my-5">
                <Button 
                  variant="outline"
                  className={`w-1/2 ${isBuying ? "bg-[#00FF88] text-black hover:bg-[#00DD77]" : ""}`}
                  onClick={() => setIsBuying(true)}
                >
                  Buy
                </Button>
                <Button 
                  variant="outline"
                  className={`w-1/2 ${!isBuying ? "bg-[#FF3333] text-white hover:bg-[#DD2222]" : ""}`}
                  onClick={() => setIsBuying(false)}
                >
                  Sell
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {isBuying ? "SOL" : merchantData?.token_name || "Token"} Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder={`Enter ${isBuying ? "SOL" : merchantData?.token_name || "token"} amount`}
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    className="w-full pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 mr-2">{isBuying ? "SOL" : merchantData?.token_name || "Token"}</span>
                    <div className="w-6 h-6 bg-gray-300 rounded-full">
                      {/* TODO: Placeholder for Solana logo */}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  {(isBuying ? buyQuickAmounts : sellQuickAmounts).map((amount) => (
                    <Badge
                      key={amount.label}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSolAmount(amount.value)}
                    >
                      {isBuying ? amount.label : `${amount.label} ${merchantData?.token_name || "Tokens"}`}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-black text-white hover:bg-gray-800 font-medium"
                onClick={handleTrade}
                disabled={!solAmount || parseFloat(solAmount) <= 0}
              >
                Execute {isBuying ? "Buy" : "Sell"}
              </Button>
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
