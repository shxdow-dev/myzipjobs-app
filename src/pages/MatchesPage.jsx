import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import AuthContext from "../context/AuthContext";
import { getMatches } from "../services/api.js";

function MatchesPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    getMatches(user._id)
      .then((data) => {
        setMatches(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="mt-20 text-center text-charcoalMuted">
        Loading matches...
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="mt-20 text-center">
        <p className="font-heading text-xl text-charcoal">No matches yet</p>
        <p className="mt-2 font-body text-charcoalMuted">
          Keep swiping to find your match!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-heading text-2xl font-bold text-charcoal">
        Your Matches
        <span className="ml-2 rounded-full bg-orangeLight px-2 py-1 text-sm text-orange">
          {matches.length}
        </span>
      </h1>
      {matches.map((match) => (
        <div
          key={match.matchId || match._id}
          className="mb-3 flex items-center gap-3 rounded-xl border border-orangeLight bg-warmWhite p-3"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orangeLight">
            <User className="h-6 w-6 text-teal" />
          </div>
          <div className="flex-1">
            <p className="font-heading font-bold text-charcoal">{match.name}</p>
            <span className="rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
              {match.category}
            </span>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate(`/dashboard/${user.role}/messages/${match.matchId}`, {
                state: {
                  otherPerson: {
                    _id: match._id,
                    name: match.name,
                    category: match.category,
                    role: match.role,
                  },
                },
              })
            }
            className="rounded-xl border border-teal px-3 py-1 font-body text-sm text-teal"
          >
            Message
          </button>
        </div>
      ))}
    </div>
  );
}

export default MatchesPage;
