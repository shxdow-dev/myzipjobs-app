import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Star, User, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { submitRating } from "../../services/api.js";
import Button from "../common/Button";

function RatingModal({ matchId, ratedUser, onClose, onSubmitted }) {
  const { user } = useAuth();
  const [selectedStars, setSelectedStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async () => {
    if (!selectedStars || !user?._id || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await submitRating({
        matchId,
        raterId: user._id,
        ratedUserId: ratedUser._id,
        stars: selectedStars,
        comment,
      });

      if (result.error) {
        setError(result.message || "Could not submit rating");
        return;
      }

      onSubmitted?.(selectedStars);
      onClose();
    } catch {
      setError("Could not submit rating");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-warmWhite p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-charcoalMuted hover:text-charcoal"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orangeLight">
          <User className="h-7 w-7 text-teal" />
        </div>

        <h2 className="text-center font-heading text-xl font-bold text-charcoal">
          How was your experience with {ratedUser.name}?
        </h2>

        <div className="mt-6 flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Rate ${star} stars`}
              onClick={() => setSelectedStars(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                size={48}
                className={
                  star <= selectedStars
                    ? "fill-orange text-orange"
                    : "text-gray-300"
                }
              />
            </button>
          ))}
        </div>

        <div className="relative mt-6">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 300))}
            placeholder="Leave a comment (optional)"
            rows={3}
            maxLength={300}
            className="w-full rounded-xl border border-charcoalMuted px-3 py-2 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-tealLight"
          />
          <span className="absolute bottom-2 right-3 text-xs text-charcoalMuted">
            {comment.length}/300
          </span>
        </div>

        {error && (
          <p className="mt-2 text-center text-sm text-alert">{error}</p>
        )}

        <Button
          className="mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
          disabled={selectedStars === 0 || submitting}
          onClick={handleSubmit}
        >
          {submitting ? "Submitting..." : "Submit Rating"}
        </Button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full text-center font-body text-sm text-charcoalMuted hover:text-charcoal"
        >
          Skip
        </button>
      </div>
    </div>,
    document.body
  );
}

export default RatingModal;
