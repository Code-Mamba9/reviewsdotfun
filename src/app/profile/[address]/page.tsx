import { supabase } from "@/lib/supabaseClient";
import type { Merchant } from "@/types";
import CreatePage from "./CreatePage";
import EditPage from "./EditPage";

export const fetchCache = "force-no-store";

interface ProfilePageProps {
  params: {
    address: string;
  };
}

interface MerchantTableResponse {
  data: MerchantArray;
  error: any;
}

type MerchantArray = Merchant[] | null;

export default async function Profile({ params }: ProfilePageProps) {
  const { address } = params;
  console.log("Fetching profile for:", address);

  try {
    const { data, error }: MerchantTableResponse = await supabase
      .from("Merchants")
      .select("*", { head: false })
      .eq("merchant_wallet_addr", address);

    if (error) {
      console.error("Error fetching merchant data:", error.message);
      return <CreatePage />;
    }

    const hasMerchant = data && data.length === 1;
    return hasMerchant ? <EditPage initialMerchant={data[0]} /> : <CreatePage />;
  } catch (error) {
    console.error("Error in profile page:", error);
    return <CreatePage />;
  }
}
