import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, ShieldAlert, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { triggerSOS } from "../../services/api.js";

const REASONS = [
  { value: "unsafe", label: "Feeling Unsafe" },
  { value: "no_show", label: "No Show" },
  { value: "harassment", label: "Harassment" },
  { value: "suspicious_behavior", label: "Suspicious Behavior" },
  { value: "other", label: "Other" },
];

function SOSModal({ matchId, otherUser, onClose }) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleSubmit = async () => {
    if (!reason || !user?._id || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const payload = {
        userId: user._id,
        reason,
        note,
      };

      if (matchId) payload.matchId = matchId;
      if (otherUser?._id) payload.otherUserId = otherUser._id;
      if (location) payload.location = location;

      const result = await triggerSOS(payload);

      if (result.message && !result._id) {
        setError(result.message || "Could not send report");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Could not send report");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-warmWhite p-6 sm:max-w-sm sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-charcoalMuted hover:text-charcoal"
        >
          <X className="h-5 w-5" />
        </button>

        {submitted ? (
          <div className="pt-2 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h2 className="mt-4 font-heading text-xl font-bold text-charcoal">
              Report Sent
            </h2>
            <p className="mt-3 font-body text-sm text-charcoalMuted">
              We&apos;ve logged your report. If you&apos;re in immediate danger,
              please contact local emergency services.
            </p>
            <p className="mt-4 font-body text-sm text-charcoalMuted">
              Police: 100 &nbsp;•&nbsp; Women&apos;s Helpline: 1091
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-xl border border-charcoal px-4 py-3 font-body text-sm text-charcoal transition hover:bg-orangeLight"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-3 pr-8">
              <ShieldAlert className="h-8 w-8 shrink-0 text-alert" />
              <div>
                <h2 className="font-heading text-xl font-bold text-charcoal">
                  Report a Safety Concern
                </h2>
                {otherUser?.name && (
                  <p className="mt-1 font-body text-sm text-charcoalMuted">
                    Regarding your meetup with {otherUser.name}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <p className="mb-2 font-body text-sm font-medium text-charcoal">
                Reason
              </p>
              <div className="flex flex-wrap gap-2">
                {REASONS.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setReason(item.value)}
                    className={`rounded-full px-3 py-1.5 font-body text-sm transition ${
                      reason === item.value
                        ? "bg-alert text-white"
                        : "bg-orangeLight text-charcoal hover:bg-orange/20"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative mt-6">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value.slice(0, 300))}
                placeholder="Add any details (optional)"
                rows={3}
                maxLength={300}
                className="w-full rounded-xl border border-charcoalMuted px-3 py-2 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-tealLight"
              />
              <span className="absolute bottom-2 right-3 text-xs text-charcoalMuted">
                {note.length}/300
              </span>
            </div>

            {error && (
              <p className="mt-2 text-center text-sm text-alert">{error}</p>
            )}

            <button
              type="button"
              disabled={!reason || submitting}
              onClick={handleSubmit}
              className="mt-6 flex h-[52px] w-full items-center justify-center rounded-xl bg-alert font-heading text-sm font-medium text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Sending..." : "Send Report"}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

export default SOSModal;
