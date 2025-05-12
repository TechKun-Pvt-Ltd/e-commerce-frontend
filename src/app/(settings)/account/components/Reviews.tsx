"use client";

import { useState } from "react";
import { Star, MessageSquare } from "lucide-react";
import Image from "next/image";

interface Review {
  id: string;
  productName: string;
  productImage: string;
  rating: number;
  comment: string;
  date: string;
}

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      productName: "Canvas Print - Nature",
      productImage: "/product-image/canvas.jpg",
      rating: 5,
      comment: "Beautiful print quality and colors are vibrant. Exactly what I was looking for!",
      date: "2024-01-10"
    }
  ]);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold text-gray-900">My Reviews</h2>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className="flex items-start gap-6">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={review.productImage}
                  alt={review.productName}
                  fill
                  className="object-cover"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-gray-900">{review.productName}</h3>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-4 h-4 ${index < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.date).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-4 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                  <p className="text-gray-600 text-sm">{review.comment}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}