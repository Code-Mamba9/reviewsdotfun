"use client";

import MerchantCard from "@/components/MerchantCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useReviewsdotfunProgram } from "@/components/reviewsdotfun/reviewsdotfun-data-access";
import { PublicKey } from "@solana/web3.js";
import { supabase } from "@/lib/supabaseClient";
import { Merchant } from "@/types/db";

interface MerchantWithStats {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  image: string;
  address: string;
}

export default function Home() {
  const router = useRouter();
  const [merchants, setMerchants] = useState<MerchantWithStats[]>([]);
  const { accounts, programId } = useReviewsdotfunProgram();
  const isLoading = accounts.isLoading;

  useEffect(() => {
    const fetchMerchantData = async () => {
      if (!accounts.data || accounts.isLoading) return;
      
      try {
        // Get all pool accounts from the blockchain
        const poolAccounts = accounts.data;
        
        // Create a list of merchant addresses from the pool accounts
        const token_mints = poolAccounts.map(pool => pool.account.mintA.toBase58());
        
        if (token_mints.length === 0) {
          setMerchants([]);
          return;
        }

        // Fetch merchant details from Supabase for the addresses we found
        const { data, error } = await supabase
          .from("Merchant")
          .select("*")
          .in("token_mint", token_mints);

        if (error) {
          console.error("Error fetching merchants:", error.message);
          return;
        }

        // Create a map of merchant data by address for quick lookup
        const merchantMap = new Map();
        data?.forEach(merchant => {
          merchantMap.set(merchant.merchant_wallet_addr, merchant);
        });

        // Transform pool accounts into merchant display data
        const merchantsWithStats = data?.map((entry, index) => {
          const merchantAddress = entry.merchant_wallet_addr;
          const merchantData = merchantMap.get(merchantAddress) || {
            name: `Merchant ${index + 1}`,
            profile_pic: null
          };
          
          return {
            id: index + 1,
            name: merchantData.name,
            rating: 4.0 + Math.random() * 0.9, // Random rating between 4.0 and 4.9
            reviews: Math.floor(Math.random() * 200) + 50, // Random review count between 50 and 250
            image: merchantData.profile_pic || "/placeholder.svg?height=100&width=100",
            address: merchantAddress
          };
        });

        setMerchants(merchantsWithStats);
      } catch (err) {
        console.error("Error processing merchant data:", err);
      }
    };

    fetchMerchantData();
  }, [accounts.data, accounts.isLoading]);

  return (
    <main className="min-h-screen min-w-full bg-black text-white">
      {/* Hero Section */}
      <div className="bg-black py-16 relative">
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48 w-full max-w-[2000px] mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-[#00FF88]">
            Reviews.Fun
            </h1>
            <p className="text-xl mb-8 text-gray-300">
              Find the best businesses and services, with transparent blockchain-verified reviews
            </p>
            <div className="flex justify-center mb-4">
              <Button 
                size="lg" 
                className="bg-[#00FF88] text-black hover:bg-[#00DD77] font-bold"
                onClick={() => router.push('/profile')}
              >
                Register as Merchant
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative border */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden">
          <div className="relative h-4">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-40 blur-sm"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00FF88] to-transparent opacity-70 h-px top-1/2 transform -translate-y-1/2"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48 w-full max-w-[2000px] mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-[#00FF88]">
            Top Rated Merchants
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-gray-300">Sort by:</span>
            <select className="border border-[#00FF88] rounded-md px-3 py-1 bg-black text-white focus:outline-none focus:ring-1 focus:ring-[#00FF88]">
              <option>Highest Rated</option>
              <option>Most Reviews</option>
              <option>Newest</option>
            </select>
          </div>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-900 rounded-lg border border-gray-800 shadow-md p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gray-800 rounded-full"></div>
                  <div>
                    <div className="h-5 bg-gray-800 rounded w-32 mb-2"></div>
                    <div className="h-4 bg-gray-800 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-800 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-800 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : merchants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {merchants.map((merchant) => (
              <div key={merchant.id} className="bg-gray-900 border border-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      <img 
                        src={merchant.image || "/placeholder.svg?height=100&width=100"} 
                        alt={merchant.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-white">{merchant.name}</h3>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className={`w-4 h-4 ${i < Math.floor(merchant.rating) ? 'text-[#00FF88]' : 'text-gray-700'}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-gray-400 text-sm">{merchant.rating.toFixed(1)} ({merchant.reviews} reviews)</span>
                      </div>
                      <div className="flex gap-2">
                        <span className="inline-block bg-[#00FF88]/20 text-[#00FF88] text-xs px-2 py-1 rounded">Web3</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end items-center">
                    <Button 
                      size="sm"
                      className="bg-[#00FF88] text-black hover:bg-[#00DD77] font-medium"
                      onClick={() => router.push(`/merchant/${merchant.address}`)}
                    >
                      Trade Or Review
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-900 border border-gray-800 rounded-lg shadow-md">
            <div className="mb-4 text-[#00FF88]">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">No merchants found</h3>
            <p className="text-gray-400 mb-6">Be the first to create a merchant profile and start earning reviews!</p>
            <Button 
              onClick={() => router.push('/profile')}
              className="bg-[#00FF88] text-black hover:bg-[#00DD77] font-bold"
            >
              Register as Merchant
            </Button>
          </div>
        )}
        
        {/* Categories Section */}
        <div className="mt-16 mb-12">
          <h2 className="text-3xl font-bold text-[#00FF88] mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['DeFi', 'Local Businesses', 'Gaming', 'Restaurants'].map((category) => (
              <div key={category} className="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 text-center hover:border-[#00FF88] hover:shadow-[0_0_10px_rgba(0,255,136,0.3)] transition-all duration-300 cursor-pointer">
                <h3 className="text-lg font-semibold mb-2 text-white">{category}</h3>
                <p className="text-gray-400 text-sm">Explore {category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-black border border-[#00FF88] rounded-xl shadow-md p-8 mb-12">
          <div className="md:flex items-center justify-between">
            <div className="md:w-2/3 mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-4 text-[#00FF88]">
                Ready to share your experience?
              </h2>
              <p className="text-gray-300 mb-6 md:mb-0">
                Join our community and help others make informed decisions. Your reviews are stored on the blockchain for transparency and trust.
              </p>
            </div>
            <div>
              <Button 
                size="lg" 
                className="bg-[#00FF88] text-black hover:bg-[#00DD77] font-bold"
                onClick={() => router.push('/profile')}
              >
                Write a Review
              </Button>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#00FF88] mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-black border-2 border-[#00FF88] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00FF88] text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Find a Merchant</h3>
              <p className="text-gray-400">Browse through our verified merchants and dApps to find services you've used.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-black border-2 border-[#00FF88] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00FF88] text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Write a Review</h3>
              <p className="text-gray-400">Share your honest experience and rate the service to help the community.</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-md p-6 text-center">
              <div className="w-16 h-16 bg-black border-2 border-[#00FF88] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#00FF88] text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">Earn Rewards</h3>
              <p className="text-gray-400">Get rewarded with merchant tokens for your valuable contributions.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
