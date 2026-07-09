import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSwipeable } from "react-swipeable";
import {
  Heart,
  Loader2,
  RotateCcw,
  SearchX,
  SendHorizonal,
  SlidersHorizontal,
  Undo2,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  getRecommendations,
  recordSwipe,
  sendJobRequest,
  undoSwipe,
} from "../../services/api.js";
import Button from "../common/Button";
import Toast from "../common/Toast";
import MatchOverlay from "./MatchOverlay";
import ProfileCard from "./ProfileCard";
import SwipeCard from "../swipe/SwipeCard";

function SwipeStack({ userRole, onMatch }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestTarget, setRequestTarget] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [sendingRequest, setSendingRequest] = useState(false);
  const [lastPassed, setLastPassed] = useState(null);
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const fetchProfiles = useCallback(async () => {
    if (!currentUser?._id) return;

    setLoading(true);
    setError(false);
    try {
      const data = await getRecommendations(currentUser._id);
      setProfiles(data.profiles || []);
      setExpanded(data.expanded || false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handlePass = async (profile) => {
    if (swiping || !currentUser?._id || !profile) return;

    setSwiping(true);
    setDragX(-400);

    try {
      await recordSwipe(currentUser._id, profile._id, "pass");
      setLastPassed(profile);
      setProfiles((prev) => prev.filter((p) => p._id !== profile._id));
    } catch {
      setError(true);
      setDragX(0);
    } finally {
      setSwiping(false);
      setDragX(0);
    }
  };

  const handleUndo = async () => {
    if (!lastPassed || !currentUser?._id) return;

    try {
      await undoSwipe(currentUser._id, lastPassed._id);
      setProfiles((prev) => [lastPassed, ...prev]);
      setLastPassed(null);
    } catch {
      showToast("Could not undo swipe", "error");
    }
  };

  const handleConnect = async (profile) => {
    if (swiping || !currentUser?._id || !profile) return;

    setSwiping(true);
    setDragX(400);

    try {
      const result = await recordSwipe(
        currentUser._id,
        profile._id,
        "connect"
      );
      setProfiles((prev) => prev.filter((p) => p._id !== profile._id));

      if (result.matched) {
        setMatchedProfile(result.matchedProfile);
        setShowMatchOverlay(true);
        onMatch?.({
          matchedProfile: result.matchedProfile,
          matchId: result.matchId,
        });
      }
    } catch {
      setError(true);
      setDragX(0);
    } finally {
      setSwiping(false);
      setDragX(0);
    }
  };

  const handleRequest = (profile) => {
    setRequestTarget(profile);
    setRequestMessage("");
    setShowRequestModal(true);
  };

  const submitRequest = async () => {
    if (!requestTarget || !currentUser?._id || sendingRequest) return;

    setSendingRequest(true);
    try {
      const result = await sendJobRequest(
        currentUser._id,
        requestTarget._id,
        requestMessage
      );

      if (result.error) {
        showToast(result.message || "Could not send request", "error");
        return;
      }

      showToast(`Request sent to ${requestTarget.name}!`, "success");
      setShowRequestModal(false);
      setRequestTarget(null);
      setRequestMessage("");
    } catch {
      showToast("Failed to send request", "error");
    } finally {
      setSendingRequest(false);
    }
  };

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (swiping) return;
      setDragX(e.deltaX);
    },
    onSwipedLeft: () => {
      setDragX(0);
      if (profiles[0]) handlePass(profiles[0]);
    },
    onSwipedRight: () => {
      setDragX(0);
      if (profiles[0]) handleConnect(profiles[0]);
    },
    preventScrollOnSwipe: true,
    trackMouse: true,
    delta: 80,
  });

  if (!currentUser) return null;

  if (loading && profiles.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-teal" />
        <p className="font-body text-charcoalMuted">Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-center">
        <p className="font-body text-charcoalMuted">
          Could not load profiles. Check your connection.
        </p>
        <Button onClick={fetchProfiles} className="gap-2">
          <RotateCcw size={18} />
          Retry
        </Button>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center px-6 py-12 text-center">
        <SearchX className="mx-auto mb-4 h-16 w-16 text-charcoalMuted" />
        <h3 className="mb-3 font-heading text-xl font-bold text-charcoal">
          No more profiles found
        </h3>
        <p className="mb-6 whitespace-pre-line font-body leading-relaxed text-charcoalMuted">
          {`Try increasing your distance,\nchanging your salary range,\nor selecting more professions.`}
        </p>
        <Button
          variant="primary"
          onClick={() =>
            navigate(`/dashboard/${currentUser.role}/preferences`)
          }
          className="flex w-full max-w-xs items-center justify-center gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Change Preferences
        </Button>
      </div>
    );
  }

  const topProfile = profiles[0];
  const nextProfile = profiles[1];

  return (
    <div className="relative mx-auto w-full max-w-md">
      {toasts.map((t, i) => (
        <Toast key={t.id} message={t.message} type={t.type} offset={i * 60} />
      ))}

      {expanded && profiles.length > 0 && (
        <div className="mb-3 rounded-xl bg-tealLight px-4 py-2 text-center font-body text-sm text-teal">
          📍 No profiles in your area — showing profiles from other cities
        </div>
      )}

      <div className="relative h-[540px]">
        {nextProfile && (
          <div className="absolute inset-0 scale-[0.96]" style={{ zIndex: 5 }}>
            <ProfileCard profile={nextProfile} userRole={userRole} />
          </div>
        )}

        <motion.div
          {...handlers}
          className="absolute inset-0"
          style={{ zIndex: 10, touchAction: "none" }}
          animate={{ rotate: dragX * 0.05, x: dragX }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {dragX < -30 && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-red-500/80"
              style={{ opacity: Math.min(Math.abs(dragX) / 120, 1) }}
            >
              <span className="font-heading text-4xl font-bold text-white">PASS</span>
            </div>
          )}
          {dragX > 30 && (
            <div
              className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-green-500/80"
              style={{ opacity: Math.min(Math.abs(dragX) / 120, 1) }}
            >
              <span className="font-heading text-4xl font-bold text-white">MATCH</span>
            </div>
          )}

          <SwipeCard profile={topProfile} userRole={userRole} />
        </motion.div>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          aria-label="Pass"
          disabled={swiping}
          onClick={() => handlePass(topProfile)}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl border-2 border-alert bg-white font-heading text-sm font-medium text-alert transition-all hover:bg-alert/5 disabled:opacity-50"
        >
          <X size={20} />
          Pass
        </button>
        <button
          type="button"
          aria-label="Request"
          disabled={swiping}
          onClick={() => handleRequest(topProfile)}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-teal font-heading text-sm font-medium text-white transition-all hover:brightness-95 disabled:opacity-50"
        >
          <SendHorizonal size={18} />
          Request
        </button>
        <button
          type="button"
          aria-label="Match"
          disabled={swiping}
          onClick={() => handleConnect(topProfile)}
          className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-orange font-heading text-sm font-medium text-white transition-all hover:bg-orangeDark disabled:opacity-50"
        >
          <Heart size={18} className="fill-white" />
          Match
        </button>
      </div>

      {lastPassed && profiles.length > 0 && (
        <button
          type="button"
          onClick={handleUndo}
          className="mx-auto mt-3 flex items-center gap-2 rounded-xl border border-teal px-4 py-2 font-body text-sm text-teal transition hover:bg-tealLight"
        >
          <Undo2 className="h-4 w-4" />
          Undo — show {lastPassed.name} again
        </button>
      )}

      {showMatchOverlay && matchedProfile && (
        <MatchOverlay
          matchData={{ matchedProfile }}
          onClose={() => {
            setShowMatchOverlay(false);
            setMatchedProfile(null);
          }}
        />
      )}

      <AnimatePresence>
        {showRequestModal && requestTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-charcoal/40"
              onClick={() => {
                setShowRequestModal(false);
                setRequestTarget(null);
              }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed bottom-0 left-0 right-0 z-[201] rounded-t-2xl bg-warmWhite p-6"
            >
              <h2 className="font-heading text-xl font-bold text-charcoal">
                Send Request to {requestTarget.name}
              </h2>
              <p className="mt-1 font-body text-sm text-charcoalMuted">
                Add an optional message
              </p>
              <textarea
                value={requestMessage}
                onChange={(e) =>
                  setRequestMessage(e.target.value.slice(0, 200))
                }
                placeholder="Hi, I'm interested in working with you. I'm available from..."
                rows={3}
                maxLength={200}
                className="mt-4 w-full rounded-xl border border-charcoalMuted px-3 py-2 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-tealLight"
              />
              <p className="mt-1 text-right text-xs text-charcoalMuted">
                {requestMessage.length}/200
              </p>
              <div className="mt-4 flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-charcoalMuted text-charcoalMuted"
                  onClick={() => {
                    setShowRequestModal(false);
                    setRequestTarget(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex flex-1 items-center justify-center gap-1"
                  disabled={sendingRequest}
                  onClick={submitRequest}
                >
                  <SendHorizonal size={16} />
                  Send Request
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SwipeStack;
