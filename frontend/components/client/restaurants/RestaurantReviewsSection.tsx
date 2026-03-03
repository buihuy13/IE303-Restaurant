import { useState } from "react";

import type { MockRestaurantReview } from "@/constants";

type RestaurantReviewsSectionProps = {
  reviews: MockRestaurantReview[];
};

export function RestaurantReviewsSection({
  reviews,
}: RestaurantReviewsSectionProps) {
  const [showAll, setShowAll] = useState(false);

  if (!reviews || reviews.length === 0) {
    return (
      <section id="reviews" className="scroll-mt-24">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-md md:p-8">
          <p className="text-lg font-semibold text-gray-900">
            No reviews yet
          </p>
          <p className="mt-2 text-sm text-gray-500">
            This is a mock restaurant. In the real app, customer reviews would
            appear here.
          </p>
        </div>
      </section>
    );
  }

  const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

  return (
    <section id="reviews" className="scroll-mt-24">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md md:p-8">
        <h2 className="mb-4 text-2xl font-bold text-gray-900 md:text-3xl">
          Customer Reviews
        </h2>
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-gray-200/70 bg-white p-4 shadow-sm"
            >
              <div className="mb-1 flex items-center justify-between gap-4">
                <p className="min-w-0 truncate font-semibold text-gray-900">
                  {review.title}
                </p>
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, index) => (
                    <span
                      key={index}
                      className={
                        index < review.rating
                          ? "text-yellow-500"
                          : "text-gray-300"
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                “{review.content}”
              </p>
            </div>
          ))}
        </div>
        {reviews.length > 3 && (
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="mt-4 w-full rounded-lg border border-[#EE4D2D]/20 bg-[#EE4D2D]/5 py-2.5 text-center text-sm font-semibold text-[#EE4D2D] hover:bg-[#EE4D2D]/10"
          >
            {showAll
              ? "Show less"
              : `View all ${reviews.length.toLocaleString()} reviews`}
          </button>
        )}
      </div>
    </section>
  );
}

