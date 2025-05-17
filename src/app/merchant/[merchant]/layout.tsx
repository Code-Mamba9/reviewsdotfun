import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merchant Page",
  description: "Trading page for a specific merchant",
};

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
