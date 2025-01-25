"use client";

import MerchantCard from "@/components/MerchantCard";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const merchants = [
  {
    id: 1,
    name: "Acme Corp",
    rating: 4.5,
    reviews: 120,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    name: "TechGadgets",
    rating: 4.2,
    reviews: 85,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    name: "FoodDelight",
    rating: 4.8,
    reviews: 200,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 4,
    name: "FashionTrends",
    rating: 4.0,
    reviews: 150,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 5,
    name: "HomeDecor",
    rating: 4.6,
    reviews: 95,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 6,
    name: "GreenGarden",
    rating: 4.3,
    reviews: 70,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 7,
    name: "ElectroMart",
    rating: 4.1,
    reviews: 110,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 8,
    name: "SportsWorld",
    rating: 4.7,
    reviews: 180,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 9,
    name: "BeautyBliss",
    rating: 4.4,
    reviews: 130,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 10,
    name: "PetParadise",
    rating: 4.9,
    reviews: 220,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 11,
    name: "BookNook",
    rating: 4.5,
    reviews: 90,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 12,
    name: "MusicMasters",
    rating: 4.2,
    reviews: 75,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 13,
    name: "CafeCorner",
    rating: 4.6,
    reviews: 160,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 14,
    name: "ToyTrove",
    rating: 4.3,
    reviews: 100,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 15,
    name: "FitnessFusion",
    rating: 4.7,
    reviews: 140,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 16,
    name: "ArtisanCrafts",
    rating: 4.8,
    reviews: 110,
    image: "/placeholder.svg?height=100&width=100",
  },
];
export default function Home() {
  const router = useRouter();
  return (
    <main className="min-h-screen min-w-full bg-blue-100">
      <div className="px-4 sm:px-6 md:px-8 lg:px-20 w-full max-w-[2000px] mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Top Rated Merchants
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 mb-12">
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} {...merchant} />
          ))}
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-3xl font-semibold mb-4">
            Ready to share your experience?
          </h2>
          <p className="text-gray-600 mb-6">
            Join our community and help others make informed decisions.
          </p>
          <Button size="lg">Write a Review</Button>
        </div>
      </div>
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 w-full max-w-[2000px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">About Us</h3>
              <p className="text-gray-400">
                We're dedicated to providing honest and helpful reviews to
                consumers.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Categories
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Top Rated
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Write a Review
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact</h3>
              <p className="text-gray-400">Email: info@reviewwebsite.com</p>
              <p className="text-gray-400">Phone: (123) 456-7890</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
