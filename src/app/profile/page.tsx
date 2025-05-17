"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfileRedirect() {
  const { publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    if (publicKey) {
      // Redirect to the user's profile page
      router.push(`/profile/${publicKey.toString()}`);
    }
  }, [publicKey, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Connecting to Wallet</h1>
        <p className="mb-4">Please connect your wallet to view your profile.</p>
        {!publicKey && (
          <p className="text-amber-600">
            No wallet connected. Please connect a wallet using the button in the top right.
          </p>
        )}
        {publicKey && <p>Redirecting to your profile...</p>}
      </div>
    </div>
  );
}
