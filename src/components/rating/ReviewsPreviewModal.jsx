import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, User, X } from "lucide-react";
import { getUserRatings } from "../../services/api.js";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (weeks === 1) return "1 week ago";
  if (weeks < 4) return `${weeks} weeks ago`;
  if (months === 1) return "1 month ago";
  return `${months} months ago`;
}

function StarRow({ stars, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={
            star <= stars ? "fill-orange text-orange" : "text-gray-300"
          }
        />
      ))}
    </div>
  );
}

function ReviewsPreviewModal({ userId, userName, onClose }) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        const data = await getUserRatings(userId);
        setReviews(Array.isArray(data.ratings) ? data.ratings : []);
        setAverageRating(data.average || 0);
        setRatingCount(data.count || 0);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative flex max-h-[85vh] w-full max-w-sm flex-col rounded-2xl bg-warmWhite p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-charcoalMuted hover:text-charcoal"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="pr-8 font-heading text-xl font-bold text-charcoal">
          {userName}&apos;s Reviews
        </h2>

        {loading ? (
          <p className="py-12 text-center font-body text-charcoalMuted">
            Loading reviews...
          </p>
        ) : ratingCount === 0 ? (
          <p className="py-12 text-center font-body text-charcoalMuted">
            No reviews yet
          </p>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-1 font-body text-sm text-charcoalMuted">
              <Star className="h-4 w-4 fill-orange text-orange" />
              <span>{averageRating.toFixed(1)}</span>
              <span>
                ({ratingCount} {ratingCount === 1 ? "review" : "reviews"})
              </span>
            </div>

            <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto pr-1">
              {reviews.map((review) => {
                const rater = review.raterId;
                return (
                  <div
                    key={review._id}
                    className="rounded-xl border border-[#e9ddd1] bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orangeLight">
                        <User className="h-5 w-5 text-teal" />
                      </div>
                      <div>
                        <p className="font-heading text-sm font-bold text-charcoal">
                          {rater?.name || "User"}
                        </p>
                        <StarRow stars={review.stars} />
                      </div>
                    </div>
                    {review.comment && (
                      <p className="mt-3 font-body text-sm text-charcoalMuted">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-charcoalMuted">
                      {formatTimeAgo(review.createdAt)}
                    </p>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default ReviewsPreviewModal;
