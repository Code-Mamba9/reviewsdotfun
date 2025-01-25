import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MerchantCardProps {
  name: string;
  rating: number;
  reviews: number;
  image: string;
}

export default function MerchantCard({
  name,
  rating,
  reviews,
  image,
}: MerchantCardProps) {
  return (
    <Link href={`/${name}`} className="block">
      <Card className="hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="p-4">
          <div className="flex items-center gap-3">
            <Image
              src={image || "/placeholder.svg"}
              alt={name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <CardTitle className="text-sm sm:text-base">{name}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center gap-1 text-sm">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{rating.toFixed(1)}</span>
            <span className="text-gray-500">({reviews})</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
