"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Star } from "lucide-react";

interface AddReviewProps {
  providerId: string;
  orderId: string;
  consumerId: string;
}

export default function AddReview({
  providerId,
  orderId,
  consumerId,
}: AddReviewProps) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (!rating || !reviewText.trim()) {
      return alert("Please add rating & review!");
    }

    setLoading(true);

    try {
      const res = await fetch(`/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": consumerId,
          "x-user-role": "consumer",
        },
        body: JSON.stringify({
          providerId,
          orderId,
          rating,
          comment: reviewText,
        }),
      });

      if (!res.ok) throw new Error("Review failed");

      setReviewText("");
      setRating(0);
    } catch (err) {
      console.error("Submit review error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-14 pb-20">
      <div className="mt-12 bg-white p-6 rounded-2xl shadow-md border">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          Rate Your Experience
        </h4>

        <div className="flex gap-1 text-4xl mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`cursor-pointer transition-all ${
                i < rating ? "text-yellow-400" : "text-gray-300"
              } hover:text-yellow-500`}
              onClick={() => setRating(i + 1)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          className="w-full p-4 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white  outline-none transition"
          placeholder="Share your experience..."
          rows={4}
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
        />

        <Button
          onClick={submitReview}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
