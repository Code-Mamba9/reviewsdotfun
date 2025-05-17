"use client";

import { useEffect, useState } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import type { Merchant } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import toast from "react-hot-toast";
import { PublicKey } from "@solana/web3.js";
import { useCluster } from "@/components/cluster/cluster-data-access";
import { useReviewsdotfunProgram } from "@/components/reviewsdotfun/reviewsdotfun-data-access";

interface MerchantAdminPageProps {
  params: {
    address: string;
  };
}

export default function MerchantAdminPage({ params }: MerchantAdminPageProps) {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const { cluster } = useCluster();
  const { programId } = useReviewsdotfunProgram();
  const router = useRouter();
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenMintAddress, setTokenMintAddress] = useState<string | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const { address } = params;

  useEffect(() => {
    const fetchMerchantData = async () => {
      try {
        setIsLoading(true);
        // Check if the connected wallet matches the address in the URL
        if (publicKey && publicKey.toString() !== address) {
          router.push("/");
          return;
        }

        const { data, error } = await supabase
          .from("Merchant")
          .select("*")
          .eq("merchant_wallet_addr", address)
          .single();

        if (error) {
          console.error("Error fetching merchant data:", error.message);
          setError(error.message);
          return;
        }

        if (!data) {
          router.push(`/profile/${address}`);
          return;
        }

        setMerchant(data);

        // Calculate the token mint address using the same derivation as in createMint
        try {
          const merchantPublicKey = new PublicKey(address);
          const [mintAddress] = await PublicKey.findProgramAddress(
            [Buffer.from("mint"), merchantPublicKey.toBuffer()],
            programId
          );
          setTokenMintAddress(mintAddress.toString());

          // Try to fetch token balance (this would need to be implemented based on your specific needs)
          // This is a placeholder - you'd need to implement the actual balance fetching
          setTokenBalance("1,000,000");
        } catch (err) {
          console.error("Error calculating token mint address:", err);
          // Don't set an error here, as we still want to show the merchant profile
        }
      } catch (err) {
        console.error("Error in merchant admin page:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMerchantData();
  }, [publicKey, address, router, programId, connection]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading merchant data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-500">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button className="mt-4" onClick={() => router.push("/")}>
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!merchant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Merchant Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No merchant profile found for this address.</p>
            <Button className="mt-4" onClick={() => router.push(`/profile/${address}`)}>
              Create Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Merchant Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center">
              {merchant.profile_pic ? (
                <Image
                  src={merchant.profile_pic}
                  alt={merchant.name}
                  width={150}
                  height={150}
                  className="rounded-full mb-4"
                />
              ) : (
                <div className="w-[150px] h-[150px] bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
              <h2 className="text-2xl font-bold">{merchant.name}</h2>
              <p className="text-gray-500 mb-2">
                <a href={merchant.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {merchant.website_url}
                </a>
              </p>
              <p className="text-sm text-gray-500 break-all">{merchant.merchant_wallet_addr}</p>
            </div>
            
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-2">Token Information</h3>
              <div className="flex items-center gap-3 mb-2">
                {merchant.token_pic ? (
                  <Image
                    src={merchant.token_pic}
                    alt={merchant.token_name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-[40px] h-[40px] bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-500 text-xs">No Img</span>
                  </div>
                )}
                <span className="font-bold">{merchant.token_name}</span>
              </div>
              
              {merchant.token_mint ? (
                <div className="text-sm text-gray-500 mt-1">
                  <div className="flex items-center gap-1">
                    <span>Token Mint:</span>
                    <span 
                      className="font-mono truncate max-w-[150px] hover:text-blue-500 cursor-pointer" 
                      title={merchant.token_mint}
                      onClick={() => {
                        if (merchant.token_mint) {
                          navigator.clipboard.writeText(merchant.token_mint);
                          toast.success("Address copied to clipboard");
                        }
                      }}
                    >
                      {merchant.token_mint && `${merchant.token_mint.substring(0, 4)}...${merchant.token_mint.substring(merchant.token_mint.length - 4)}`}
                    </span>
                    <button 
                      onClick={() => {
                        if (merchant.token_mint) {
                          navigator.clipboard.writeText(merchant.token_mint);
                          toast.success("Address copied to clipboard");
                        }
                      }}
                      className="text-blue-500 hover:text-blue-700"
                      title="Copy to clipboard"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 mt-1">Token not yet minted on-chain</p>
              )}
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full mb-2"
                onClick={() => router.push(`/profile/${address}/edit`)}
              >
                Edit Profile
              </Button>
              <Link href={`/merchant/${merchant.name}`} className="block">
                <Button variant="outline" className="w-full">
                  View Public Page
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="token">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="token">Token</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="token" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Token Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      {merchant.token_pic ? (
                        <Image
                          src={merchant.token_pic}
                          alt={merchant.token_name}
                          width={60}
                          height={60}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-[60px] h-[60px] bg-gray-200 rounded-full flex items-center justify-center">
                          <span className="text-gray-500 text-xs">No Img</span>
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-bold">{merchant.token_name}</h3>
                        <p className="text-sm text-gray-500">{merchant.name} Token</p>
                      </div>
                    </div>

                    {tokenMintAddress ? (
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium">Token Mint Address</span>
                            <button 
                              onClick={() => {
                                if (tokenMintAddress) {
                                  navigator.clipboard.writeText(tokenMintAddress);
                                  toast.success("Address copied to clipboard");
                                }
                              }}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              Copy
                            </button>
                          </div>
                          <div className="font-mono text-xs truncate">
                            {tokenMintAddress}
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                          <div className="text-sm font-medium mb-2">Token Supply</div>
                          <div className="text-2xl font-bold">{tokenBalance}</div>
                          <div className="text-xs text-gray-500">Total supply</div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-6">
                        <p className="mb-4">Unable to find token information on-chain.</p>
                        <Button onClick={() => window.location.reload()}>Refresh</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Token Price</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0.00 SOL</div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Market Cap</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0.00 SOL</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="reviews" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>No reviews yet.</p>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">0</div>
                      <p className="text-xs text-gray-500">No reviews yet</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">N/A</div>
                      <p className="text-xs text-gray-500">No ratings yet</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
