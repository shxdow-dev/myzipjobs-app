import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Star } from "lucide-react";
import Button from "./Button";
import { submitRating } from "../../services/api.js";

const SCORE_LABELS = {
  1: "Poor 😞",
  2: "Fair 😐",
  3: "Good 🙂",
  4: "Very Good 😊",
  5: "Excellent! 🌟",
};

function RatingModal({ match, currentUser, onClose, onSubmitted, showToast }) {
  const [score, setScore] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const otherPerson = {
    _id: match._id,
    name: match.name,
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async () => {
    if (!score || submitting || !currentUser?._id) return;

    setSubmitting(true);
    try {
      const result = await submitRating(
        match.matchId,
        currentUser._id,
        otherPerson._id,
        score,
        review
      );

      if (result.success) {
        onSubmitted?.(match.matchId, score);
        showToast?.("Rating submitted! Thanks 🙏", "success");
        onClose();
      } else {
        showToast?.(result.message || "Could not submit rating", "error");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "spring", damping: 25 }}
          className="w-full max-w-[360px] rounded-2xl bg-warmWhite p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
            <Star className="mx-auto h-12 w-12 fill-orange text-orange" />
            <h2 className="mt-3 font-heading text-xl font-bold text-charcoal">
              Rate this Match
            </h2>
            <p className="mt-1 text-center font-body text-sm text-charcoalMuted">
              Share your experience with {otherPerson.name}
            </p>
          </div>

          <div className="my-4 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setScore(star)}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                className="p-1"
              >
                <Star
                  className={`h-10 w-10 transition-all ${
                    star <= (hovered || score)
                      ? "scale-110 fill-orange text-orange"
                      : "text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>

          {(hovered || score) > 0 && (
            <p className="text-center font-heading text-orange">
              {SCORE_LABELS[hovered || score]}
            </p>
          )}

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value.slice(0, 200))}
            placeholder="Write a review (optional)..."
            rows={2}
            maxLength={200}
            className="mt-3 w-full resize-none rounded-xl border border-charcoalMuted p-3 font-body text-sm outline-none focus:border-teal"
          />
          <p className="mt-1 text-right text-xs text-charcoalMuted">
            {review.length}/200
          </p>

          <Button
            className="mt-4 w-full disabled:cursor-not-allowed disabled:opacity-50"
            disabled={score === 0 || submitting}
            onClick={handleSubmit}
          >
            {submitting ? "Submitting..." : "Submit Rating"}
          </Button>

          <button
            type="button"
            onClick={onClose}
            className="mt-3 w-full text-center font-body text-sm text-charcoalMuted hover:text-charcoal"
          >
            Maybe Later
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

export default RatingModal;
