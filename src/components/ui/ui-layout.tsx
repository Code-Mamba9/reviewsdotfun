"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { ReactNode, Suspense, useRef, useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

import { AccountChecker } from "../account/account-ui";
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from "../cluster/cluster-ui";
import { WalletButton } from "../solana/solana-provider";
// import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Home() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  );
}

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  const { publicKey } = useWallet();
  const [isAdmin, setIsAdmin] = useState(false);
  const [displayLinks, setDisplayLinks] = useState(links);

  // Check if the connected wallet is in the ADMIN_KEYS list
  useEffect(() => {
    if (!publicKey) {
      setIsAdmin(false);
      setDisplayLinks([]);
      return;
    }

    const walletAddress = publicKey.toString();
    const adminKeysStr = process.env.NEXT_PUBLIC_ADMIN_KEYS || '[]';
    try {
      const adminKeys = JSON.parse(adminKeysStr);
      const isWalletAdmin = Array.isArray(adminKeys) && adminKeys.includes(walletAddress);
      setIsAdmin(isWalletAdmin);
      
      if (isWalletAdmin) {
        // Only show Admin tab if the wallet is in the admin list
        setDisplayLinks([
          { label: 'Admin', path: '/admin' }
        ]);
      } else {
        setDisplayLinks([]);
      }
    } catch (error) {
      console.error('Error parsing ADMIN_KEYS:', error);
      setIsAdmin(false);
      setDisplayLinks([]);
    }
  }, [publicKey, links]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <header className="sticky top-0 z-50 bg-black border-b border-gray-800 shadow-md">
        <div className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-32 2xl:px-48 mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <div className="flex items-center mb-4 md:mb-0">
              <Link className="text-[#00FF88] font-bold text-2xl mr-8" href="/">
                Reviews.Fun
              </Link>
              <nav className="hidden md:flex space-x-6">
                {displayLinks.map(({ label, path }: { label: string; path: string }) => (
                  <Link
                    key={path}
                    className={`text-sm font-medium transition-colors hover:text-[#00FF88] ${pathname.startsWith(path) ? "text-[#00FF88]" : "text-gray-300"}`}
                    href={path}
                  >
                    {label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <WalletButton />
              <ClusterUiSelect />
            </div>
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden pb-2">
            <nav className="flex justify-center space-x-4">
              {displayLinks.map(({ label, path }: { label: string; path: string }) => (
                <Link
                  key={path}
                  className={`text-sm font-medium transition-colors hover:text-[#00FF88] ${pathname.startsWith(path) ? "text-[#00FF88]" : "text-gray-300"}`}
                  href={path}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>
      
      <ClusterChecker>
        <AccountChecker />
      </ClusterChecker>
      <div className="flex-grow">
        <Suspense
          fallback={
            <div className="text-center my-32">
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          }
        >
          {children}
        </Suspense>
        <Toaster position="bottom-right" />
      </div>
      <footer className="footer footer-center p-4 bg-black text-gray-400">
        <aside>
          <p>© reviews.fun 2025</p>
        </aside>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || "Save"}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === "string" ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === "string" ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = "", len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + ".." + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={"text-center"}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={"View Transaction"}
          className="btn btn-xs btn-primary"
        />
      </div>,
    );
  };
}
