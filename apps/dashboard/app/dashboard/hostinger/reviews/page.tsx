"use client";

import { useState, useEffect } from "react";
import { Star, User, Quote, Award } from "lucide-react";

interface Review {
  id: string;
  authorName: string;
  title: string;
  avatar: string;
  rating: number;
  content: string;
  serviceType: string;
  featured: boolean;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/hostinger-services/reviews", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setReviews(data.reviews || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Customer Reviews</h1>
        <p className="text-gray-500">What our customers say about us</p>
      </div>

      {reviews.length === 0 ? (
        <div className="card">
          <div className="card-body text-center py-12">
            <Quote className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 font-medium">No reviews yet</p>
            <p className="text-gray-400 text-sm mt-1">Reviews will appear here once collected</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reviews.map((review) => (
            <div key={review.id} className={`card p-5 ${review.featured ? "ring-2 ring-yellow-400" : ""}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-200 to-purple-200 rounded-full flex items-center justify-center overflow-hidden">
                    {review.avatar ? (
                      <img src={review.avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-brand-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{review.authorName}</h3>
                    <p className="text-xs text-gray-500">{review.title}</p>
                  </div>
                </div>
                {review.featured && <Award className="w-5 h-5 text-yellow-500" />}
              </div>
              <div className="flex items-center gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-200"}`} />
                ))}
              </div>
              <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                <Quote className="w-3 h-3 inline text-gray-300 mr-1" />
                {review.content}
              </p>
              <span className="badge badge-info text-[10px]">{review.serviceType}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
