"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Star, Plus, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Review {
  id: string;
  username: string;
  rating: number;
  comment: string;
  transactionId?: string;
  photos?: string[];
  date: string;
}

export function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      username: "CryptoTrader123",
      rating: 5,
      comment: "Great merchant with reliable trades!",
      date: "2 days ago",
    },
    {
      id: "2",
      username: "SOLInvestor",
      rating: 4,
      comment: "Smooth transaction, would trade again.",
      date: "5 days ago",
    },
  ]);

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
    transactionId: "",
    photos: [] as File[],
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRatingClick = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewReview((prev) => ({
        ...prev,
        photos: Array.from(event.target.files || []),
      }));
    }
  };

  const submitReview = () => {
    if (newReview.rating > 0 && newReview.comment.trim()) {
      const reviewToAdd: Review = {
        id: (reviews.length + 1).toString(),
        username: "Anonymous",
        rating: newReview.rating,
        comment: newReview.comment,
        transactionId: newReview.transactionId,
        photos: newReview.photos.length
          ? newReview.photos.map((file) => URL.createObjectURL(file))
          : undefined,
        date: "Just now",
      };
      setReviews([reviewToAdd, ...reviews]);
      setNewReview({ rating: 0, comment: "", transactionId: "", photos: [] });
      setIsModalOpen(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-4 mb-6">
        <h2 className="text-2xl font-bold">Reviews</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[475px]">
            <DialogHeader>
              <DialogTitle>Add Your Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex space-x-2 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-8 w-8 cursor-pointer ${
                      newReview.rating >= star
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                    onClick={() => handleRatingClick(star)}
                  />
                ))}
              </div>
              <Input
                placeholder="SOL Transaction ID"
                value={newReview.transactionId}
                required
                onChange={(e) =>
                  setNewReview((prev) => ({
                    ...prev,
                    transactionId: e.target.value,
                  }))
                }
              />
              <Textarea
                placeholder="Write your review..."
                value={newReview.comment}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, comment: e.target.value }))
                }
                className="w-full"
              />
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="flex items-center cursor-pointer"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  <span>
                    {newReview.photos.length
                      ? `${newReview.photos.length} photo(s) selected`
                      : "Upload Photos (Optional)"}
                  </span>
                </label>
              </div>
              <Button
                onClick={submitReview}
                disabled={
                  !newReview.rating ||
                  !newReview.comment.trim() ||
                  !newReview.transactionId.trim()
                }
                className="w-full"
              >
                Submit Review
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold">{review.username}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          review.rating >= star
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
