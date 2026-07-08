import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Loader2, RotateCcw, X } from "lucide-react";
import { getRecommendations, recordSwipe } from "../../services/api";
import Button from "../common/Button";
import ProfileCard from "./ProfileCard";

function SwipeStack({ userId, userRole, onMatch }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [swiping, setSwiping] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const data = await getRecommendations(userId);
      setProfiles(data.profiles || []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSwipe = async (action) => {
    if (swiping || profiles.length === 0) return;

    const current = profiles[0];
    setSwiping(true);

    try {
      const response = await recordSwipe(userId, current._id, action);
      const remaining = profiles.slice(1);
      setProfiles(remaining);

      if (response.matched) {
        onMatch?.({
          matchedProfile: response.matchedProfile,
          matchId: response.matchId,
        });
      }

      if (remaining.length === 0) {
        const data = await getRecommendations(userId);
        if (data.profiles?.length > 0) {
          setProfiles(data.profiles);
        }
      }
    } catch {
      setError(true);
    } finally {
      setSwiping(false);
    }
  };


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

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="relative h-[480px]">
        {profiles.slice(0, 2).map((profile, index) => (
          <SwipeCard
            key={profile._id}
            profile={profile}
            userRole={userRole}
            isTop={index === 0}
            onSwipe={handleSwipe}
            disabled={swiping}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          type="button"
          aria-label="Pass"
          disabled={swiping}
          onClick={() => handleSwipe("pass")}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-charcoalMuted bg-white text-charcoalMuted transition-all hover:border-alert hover:text-alert disabled:opacity-50"
        >
          <X size={28} />
        </button>
        <button
          type="button"
          aria-label="Connect"
          disabled={swiping}
          onClick={() => handleSwipe("connect")}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-orange text-white shadow-md transition-all hover:bg-orangeDark active:scale-95 disabled:opacity-50"
        >
          <span className="font-heading text-lg font-bold">✓</span>
        </button>
      </div>
    </div>
  );
}

function SwipeCard({ profile, userRole, isTop, onSwipe, disabled }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const passOpacity = useTransform(x, [-120, -40], [1, 0]);
  const connectOpacity = useTransform(x, [40, 120], [0, 1]);

  const handleDragEnd = (_event, info) => {
    if (disabled) return;
    if (info.offset.x > 100) {
      onSwipe("connect");
    } else if (info.offset.x < -100) {
      onSwipe("pass");
    }
  };

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: isTop ? 1 : 0.96,
        zIndex: isTop ? 10 : 5,
      }}
      drag={isTop && !disabled ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      {isTop && (
        <>
          <motion.div
            className="pointer-events-none absolute left-4 top-4 z-20 rounded-lg border-2 border-alert px-3 py-1 font-heading text-lg font-bold text-alert"
            style={{ opacity: passOpacity }}
          >
            PASS
          </motion.div>
          <motion.div
            className="pointer-events-none absolute right-4 top-4 z-20 rounded-lg border-2 border-success px-3 py-1 font-heading text-lg font-bold text-success"
            style={{ opacity: connectOpacity }}
          >
            CONNECT
          </motion.div>
        </>
      )}
      <ProfileCard profile={profile} userRole={userRole} />
    </motion.div>
  );
}

export default SwipeStack;
