import { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { useParams } from "react-router-dom";
import PageMotion from "../../components/common/PageMotion";
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

function ReviewsListPage() {
  const { userId } = useParams();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchReviews = async () => {
      try {
        const data = await getUserRatings(userId);
        setReviews(Array.isArray(data.ratings) ? data.ratings : []);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [userId]);

  if (loading) {
    return (
      <div className="py-12 text-center text-charcoalMuted">
        Loading reviews...
      </div>
    );
  }

  return (
    <PageMotion className="pb-24">
      {reviews.length === 0 ? (
        <p className="py-16 text-center font-body text-charcoalMuted">
          No reviews yet
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const rater = review.raterId;
            return (
              <div
                key={review._id}
                className="rounded-xl border border-[#e9ddd1] bg-warmWhite p-4"
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
      )}
    </PageMotion>
  );
}

export default ReviewsListPage;
