import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { getUserRatings } from "../../services/api.js";
import ProfileCard from "../dashboard/ProfileCard";
import ReviewsPreviewModal from "../rating/ReviewsPreviewModal";

function SwipeCard({ profile, userRole }) {
  const [showReviews, setShowReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);

  useEffect(() => {
    if (!profile?._id) return;

    const average = profile.averageRating ?? profile.rating;
    const count = profile.ratingCount;

    if (average != null && count != null) {
      setAverageRating(average);
      setRatingCount(count);
      return;
    }

    getUserRatings(profile._id).then((data) => {
      setAverageRating(data.average || 0);
      setRatingCount(data.count || 0);
    });
  }, [
    profile?._id,
    profile?.averageRating,
    profile?.rating,
    profile?.ratingCount,
  ]);

  const stopSwipe = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="relative h-full">
      <ProfileCard profile={profile} userRole={userRole} />

      {ratingCount > 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-[52%] z-10 flex justify-center px-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowReviews(true);
            }}
            onPointerDown={stopSwipe}
            onTouchStart={stopSwipe}
            onMouseDown={stopSwipe}
            className="pointer-events-auto flex items-center gap-1 rounded-full bg-tealLight px-3 py-1 font-body text-sm text-teal"
          >
            <Star className="h-3.5 w-3.5 fill-orange text-orange" />
            <span>
              {averageRating.toFixed(1)} · {ratingCount}{" "}
              {ratingCount === 1 ? "review" : "reviews"}
            </span>
          </button>
        </div>
      )}

      {showReviews && (
        <ReviewsPreviewModal
          userId={profile._id}
          userName={profile.name}
          onClose={() => setShowReviews(false)}
        />
      )}
    </div>
  );
}

export default SwipeCard;
