import CreatePage from "./CreatePage";
import { supabase } from "@/lib/supabaseClient";
import EditPage from "./EditPage";
import { Merchant } from "@/types";

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
  const { address } = params; // Corrected variable name to match ProfileParams
  console.log("Fetching profile for:", address);

  const { data, error }: MerchantTableResponse = await supabase
    .from("Merchants")
    .select("*")
    .eq("merchant_wallet_addr", address);

  if (error) {
    console.error("Error fetching merchant data:", error.message);
  }
  const hasMerchant = data?.length === 1;
  return hasMerchant ? <EditPage merchant={data[0]} /> : <CreatePage />;
}
