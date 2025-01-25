"use client";
import { useState } from "react";
import { ChartComponent } from "@/components/TradingViewChart";
import { ReviewSection } from "@/components/Reviewsection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const quickAmounts = [
  { label: "Reset", value: "" },
  { label: "1 SOL", value: "1" },
  { label: "5 SOL", value: "5" },
  { label: "10 SOL", value: "10" },
];

const chartData = [
  { time: "2023-01-01", open: 10, high: 12, low: 9, close: 11 },
  { time: "2023-01-02", open: 11, high: 13, low: 10, close: 12 },
];

interface MerchantPageProps {
  params: {
    merchant: string;
  };
}

export default function TradePage({ params }: MerchantPageProps) {
  const [solAmount, setSolAmount] = useState("");
  const { merchant } = params;

  return (
    <div className="flex flex-col min-h-screen pt-16 mx-20">
      <h1 className="absolute top-4 left-1/2 transform -translate-x-1/2 text-4xl font-bold text-gray-800">
        {merchant}
      </h1>
      <div className="flex">
        <div className="w-2/3 pr-8 pt-4">
          <ChartComponent
            data={chartData}
            colors={{
              backgroundColor: "white",
              lineColor: "#2962FF",
              textColor: "black",
            }}
          />
        </div>
        <div className="w-1/3 pt-4">
          <Card className="p-2 py-4">
            <CardContent className="space-y-6">
              <div className="flex space-x-4 my-5">
                <Button variant="outline" className="w-1/2">
                  Buy
                </Button>
                <Button variant="destructive" className="w-1/2">
                  Sell
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  SOL Amount
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Enter SOL amount"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    className="w-full pr-16"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-400 mr-2">SOL</span>
                    <div className="w-6 h-6 bg-gray-300 rounded-full">
                      {/* TODO: Placeholder for Solana logo */}
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  {quickAmounts.map((amount) => (
                    <Badge
                      key={amount.label}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setSolAmount(amount.value)}
                    >
                      {amount.label}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button className="w-full">Execute Trade</Button>
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
