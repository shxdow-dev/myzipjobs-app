import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSwipeable } from "react-swipeable";
import { Heart, Loader2, RotateCcw, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getRecommendations, recordSwipe } from "../../services/api.js";
import Button from "../common/Button";
import MatchOverlay from "./MatchOverlay";
import ProfileCard from "./ProfileCard";

function SwipeCard({ profile, userRole, onPass, onConnect }) {
  return (
    <div className="relative h-full">
      <ProfileCard profile={profile} userRole={userRole} />
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-0" />
      <div className="sr-only">
        <button type="button" onClick={onPass}>Pass</button>
        <button type="button" onClick={onConnect}>Connect</button>
      </div>
    </div>
  );
}

function SwipeStack({ userRole, onMatch }) {
  const { user: currentUser } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [showMatchOverlay, setShowMatchOverlay] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);

  const fetchProfiles = useCallback(async () => {
    if (!currentUser?._id) return;

    setLoading(true);
    setError(false);
    try {
      const data = await getRecommendations(currentUser._id);
      setProfiles(data.profiles || []);
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
      setProfiles((prev) => prev.filter((p) => p._id !== profile._id));
    } catch {
      setError(true);
      setDragX(0);
    } finally {
      setSwiping(false);
      setDragX(0);
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

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (swiping) return;
      setDragX(e.deltaX);
    },
    onSwipedLeft: () => {
      setDragX(0);
      if (profiles[0]) {
        handlePass(profiles[0]);
      }
    },
    onSwipedRight: () => {
      setDragX(0);
      if (profiles[0]) {
        handleConnect(profiles[0]);
      }
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
      <div className="flex min-h-[400px] flex-col items-center justify-center text-center">
        <p className="font-body text-lg text-charcoalMuted">
          No profiles found nearby. Check back later!
        </p>
        <Button variant="outline" className="mt-4" onClick={fetchProfiles}>
          Refresh
        </Button>
      </div>
    );
  }

  const topProfile = profiles[0];
  const nextProfile = profiles[1];

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative h-[540px]">
        {nextProfile && (
          <div
            className="absolute inset-0 scale-[0.96]"
            style={{ zIndex: 5 }}
          >
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
          {dragX > 30 && (
            <div className="absolute left-4 top-4 z-10 rounded-full bg-green-500 px-3 py-1 font-heading text-lg text-white">
              ❤️ Connect!
            </div>
          )}
          {dragX < -30 && (
            <div className="absolute right-4 top-4 z-10 rounded-full bg-red-500 px-3 py-1 font-heading text-lg text-white">
              ✕ Pass
            </div>
          )}

          <SwipeCard
            profile={topProfile}
            userRole={userRole}
            onPass={() => handlePass(topProfile)}
            onConnect={() => handleConnect(topProfile)}
          />
        </motion.div>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Pass"
          disabled={swiping}
          onClick={() => handlePass(topProfile)}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-charcoalMuted bg-white text-charcoalMuted transition-all hover:border-alert hover:text-alert disabled:opacity-50"
        >
          <X size={28} />
        </button>
        <button
          type="button"
          aria-label="Connect"
          disabled={swiping}
          onClick={() => handleConnect(topProfile)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-orange text-white shadow-md transition-all hover:bg-orangeDark active:scale-95 disabled:opacity-50"
        >
          <Heart size={28} className="fill-white" />
        </button>
      </div>

      {showMatchOverlay && matchedProfile && (
        <MatchOverlay
          matchData={{ matchedProfile }}
          onClose={() => {
            setShowMatchOverlay(false);
            setMatchedProfile(null);
          }}
        />
      )}
    </div>
  );
}

export default SwipeStack;
