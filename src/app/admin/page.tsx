"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PublicKey } from "@solana/web3.js";
import { useReviewsdotfunProgram } from "@/components/reviewsdotfun/reviewsdotfun-data-access";
import { useQuery } from "@tanstack/react-query";

export default function AdminPage() {
  const { publicKey } = useWallet();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const { program, programId, initGlobal } = useReviewsdotfunProgram();
  
  // Check if the global program is already initialized
  const globalPdaQuery = useQuery({
    queryKey: ["global-pda-exists"],
    queryFn: async () => {
      if (!program) return { exists: false };
      
      try {
        // Find the global PDA
        const [globalPda] = await PublicKey.findProgramAddress(
          [Buffer.from("global")],
          programId
        );
        
        // Check if the account exists
        const account = await program.account.global.fetch(globalPda).catch(() => null);
        return { exists: !!account, globalPda };
      } catch (error) {
        console.error("Error checking global PDA:", error);
        return { exists: false };
      }
    },
    enabled: !!program && !!programId,
  });

  useEffect(() => {
    // Check if the user is an admin
    if (!publicKey) {
      router.push("/");
      return;
    }

    const walletAddress = publicKey.toString();
    const adminKeysStr = process.env.NEXT_PUBLIC_ADMIN_KEYS || '[]';
    
    try {
      const adminKeys = JSON.parse(adminKeysStr);
      if (Array.isArray(adminKeys) && adminKeys.includes(walletAddress)) {
        setIsAdmin(true);
      } else {
        // Not an admin, redirect to home
        router.push("/");
      }
    } catch (error) {
      console.error('Error parsing ADMIN_KEYS:', error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect in the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Program Initialization</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            {globalPdaQuery.isLoading
              ? "Checking program status..."
              : globalPdaQuery.data?.exists
              ? "Program has already been initialized"
              : "Initialize the Global Settings"}
          </p>
          <Button
            onClick={async () => {
              if (!publicKey) return;
              setIsInitializing(true);
              try {
                await initGlobal.mutateAsync({
                  authority: publicKey,
                  fee_vault: publicKey,
                });
                await globalPdaQuery.refetch();
              } catch (error) {
                console.error("Failed to initialize global:", error);
              } finally {
                setIsInitializing(false);
              }
            }}
            disabled={
              globalPdaQuery.isLoading ||
              globalPdaQuery.data?.exists ||
              isInitializing ||
              !publicKey
            }
          >
            {isInitializing
              ? "Initializing..."
              : globalPdaQuery.data?.exists
              ? "Already Initialized"
              : "Initialize Program"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
