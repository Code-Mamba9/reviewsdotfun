"use client";
import { FC } from "react";
import { Merchant } from "@/types";

interface EditPageProps {
  merchant: Merchant;
}

const EditPage: FC<EditPageProps> = ({ merchant }) => {
  console.log(merchant); // Corrected from 'data' to 'merchant'

  return <p>{merchant["merchant_wallet_addr"]}</p>;
};

export default EditPage;
