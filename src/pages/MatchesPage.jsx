import { useEffect, useState } from "react";
import { BadgeCheck, HeartOff, Loader2, MapPin, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getMatches } from "../services/api";

function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    getMatches(user._id)
      .then((data) => setMatches(data.matches || []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-teal" />
        <p className="font-body text-charcoalMuted">Loading matches...</p>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <HeartOff size={48} className="text-charcoalMuted" />
        <p className="mt-4 font-body text-charcoalMuted">
          No matches yet. Keep swiping!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal">
        Your Matches
      </h1>
      <p className="mt-1 font-body text-sm text-charcoalMuted">
        {matches.length} connection{matches.length !== 1 ? "s" : ""}
      </p>

      <div className="mt-6 space-y-3">
        {matches.map(({ matchId, profile }) => (
          <div
            key={matchId}
            className="flex items-center gap-4 rounded-2xl border border-[#e9ddd1] bg-white p-4"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orangeLight">
              <User size={28} className="text-teal" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate font-heading text-lg font-bold text-charcoal">
                  {profile.name}
                </h2>
                {profile.verified && (
                  <BadgeCheck size={16} className="shrink-0 text-teal" />
                )}
              </div>
              <p className="font-body text-sm text-charcoalMuted">
                {profile.category}
              </p>
              {profile.location?.area && (
                <div className="mt-1 flex items-center gap-1 text-charcoalMuted">
                  <MapPin size={14} />
                  <span className="font-body text-xs">
                    {profile.location.area}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MatchesPage;
