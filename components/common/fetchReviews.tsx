import { formatISTDate } from "@/utils/utils";
import { Check, Star } from "lucide-react";
import React, { useEffect, useState } from "react";

interface ReviewsSectionProps {
  providerId: string;
}
export default function fetchReviews({ providerId }: ReviewsSectionProps) {

  const [reviews, setReviews] = useState<any[]>([]);
  
  useEffect(() => {
    if (providerId) fetchReviews();
  }, [providerId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?providerId=${providerId}`);
      const data = await res.json();
      setReviews(data.data || []);
    } catch (err) {
      console.error("Fetch review error:", err);
    }
  };

  return (
    <>
      {reviews.length === 0 ? (
        <p className="text-gray-500 text-sm">No reviews yet.</p>
      ) : (
        <div className="space-y-6">
          {reviews.map((rev) => (
            <div
              key={rev._id}
              className="p-5 bg-white rounded-2xl shadow hover:shadow-lg transition-all duration-300 border"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex justify-center items-center font-bold text-xl">
                  {rev.consumerId?.name
                    ? rev.consumerId.name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900">
                      {rev.consumerId?.name || "User"}
                    </p>

                    {rev.isVerified && (
                      <span className="flex items-center gap-1 text-green-600 text-xs font-medium bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                        <Check size={12} />
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-1 bg-green-600 text-white px-2 py-0.5 rounded-md w-fit text-xs font-semibold">
                    {rev.rating} <Star size={12} className="fill-white" />
                  </div>

                  <p className="text-xs text-gray-400 mt-1">
                    {formatISTDate(rev.createdAt)}
                  </p>

                  <p className="mt-3 text-gray-700 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
