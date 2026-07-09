import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  BadgeCheck,
  CheckCircle,
  Clock,
  Inbox,
  IndianRupee,
  MapPin,
  SendHorizonal,
  Star,
  User,
  X,
} from "lucide-react";
import PageMotion from "../components/common/PageMotion";
import RatingModal from "../components/rating/RatingModal";
import AuthContext from "../context/AuthContext";
import {
  checkAlreadyRated,
  getIncomingRequests,
  getMatches,
  getOutgoingRequests,
  getUserRatings,
  respondToRequest,
} from "../services/api.js";

function formatTimeAgo(dateString) {
  if (!dateString) return "";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function formatWages(wages) {
  if (wages?.min == null && wages?.max == null) return null;
  return `₹${(wages.min || 0).toLocaleString("en-IN")} — ₹${(wages.max || 0).toLocaleString("en-IN")}/mo`;
}

function StarsText({ count }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={
            star <= count ? "fill-orange text-orange" : "text-gray-300"
          }
        />
      ))}
    </span>
  );
}

function MatchRatingAction({
  matchId,
  otherUser,
  userId,
  ratingStatus,
  onRated,
  onOpenModal,
}) {
  const status = ratingStatus[matchId];

  if (status?.alreadyRated) {
    return (
      <p className="border-t border-[#e9ddd1] px-3 py-2 text-center font-body text-sm text-charcoalMuted">
        You rated this <StarsText count={status.stars} />
      </p>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onOpenModal(matchId, otherUser)}
      className="w-full border-t border-[#e9ddd1] py-2 font-body text-sm text-teal transition hover:bg-tealLight/30"
    >
      Rate this match
    </button>
  );
}

function MatchesPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast, refreshRequestCount, setMatchData } =
    useOutletContext() || {};
  const [activeTab, setActiveTab] = useState("requests");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingStatus, setRatingStatus] = useState({});
  const [senderRatings, setSenderRatings] = useState({});
  const [ratingModal, setRatingModal] = useState(null);

  const loadMatches = () => {
    if (!user?._id) return;
    getMatches(user._id).then((data) => {
      setMatches(Array.isArray(data) ? data : []);
    });
  };

  const loadRatingStatus = (matchList) => {
    if (!user?._id || matchList.length === 0) return;

    Promise.all(
      matchList.map((match) =>
        checkAlreadyRated(match.matchId, user._id).then((res) => [
          match.matchId,
          res,
        ])
      )
    ).then((results) => {
      const map = {};
      results.forEach(([id, res]) => {
        map[id] = res;
      });
      setRatingStatus((prev) => ({ ...prev, ...map }));
    });
  };

  useEffect(() => {
    if (!user?._id) return;
    Promise.all([
      getIncomingRequests(user._id),
      getOutgoingRequests(user._id),
      getMatches(user._id),
    ])
      .then(([inc, out, mat]) => {
        setIncoming(Array.isArray(inc) ? inc : []);
        setOutgoing(Array.isArray(out) ? out : []);
        const matchList = Array.isArray(mat) ? mat : [];
        setMatches(matchList);
        loadRatingStatus(matchList);
      })
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user?._id || activeTab !== "sent") return;
    Promise.all([getOutgoingRequests(user._id), getMatches(user._id)]).then(
      ([out, mat]) => {
        setOutgoing(Array.isArray(out) ? out : []);
        const matchList = Array.isArray(mat) ? mat : [];
        setMatches(matchList);
        loadRatingStatus(matchList);
      }
    );
  }, [user, activeTab]);

  useEffect(() => {
    if (incoming.length === 0) return;

    const uniqueIds = [
      ...new Set(incoming.map((r) => String(r.sentBy._id))),
    ];

    Promise.all(
      uniqueIds.map((id) =>
        getUserRatings(id).then((data) => [id, data])
      )
    ).then((results) => {
      const map = {};
      results.forEach(([id, data]) => {
        map[id] = data;
      });
      setSenderRatings(map);
    });
  }, [incoming]);

  const getMatchIdForUser = (otherUserId) => {
    const found = matches.find((m) => String(m._id) === String(otherUserId));
    return found?.matchId;
  };

  const openRatingModal = async (matchId, otherUser) => {
    const status = await checkAlreadyRated(matchId, user._id);
    if (status.alreadyRated) {
      setRatingStatus((prev) => ({ ...prev, [matchId]: status }));
      return;
    }
    setRatingModal({ matchId, otherUser });
  };

  const handleRated = (matchId, stars) => {
    setRatingStatus((prev) => ({
      ...prev,
      [matchId]: { alreadyRated: true, stars },
    }));
    showToast?.("Rating submitted! Thank you ⭐", "success");
  };

  const handleRespond = async (requestId, action, sender) => {
    try {
      const result = await respondToRequest(requestId, user._id, action);
      if (result.error) {
        showToast?.(result.message || "Something went wrong.", "error");
        return;
      }
      setIncoming((prev) => prev.filter((r) => r._id !== requestId));
      refreshRequestCount?.();

      if (action === "accept" && result.accepted) {
        setMatchData?.({
          matchedProfile: result.matchedProfile || sender,
          matchId: result.matchId,
        });
        showToast?.("Connected! You can now message them 🎉", "success");
        loadMatches();
        setActiveTab("matches");
      } else if (action === "reject") {
        getOutgoingRequests(user._id).then((data) => {
          setOutgoing(Array.isArray(data) ? data : []);
        });
        showToast?.("Request declined", "error");
      }
    } catch {
      showToast?.("Something went wrong. Try again.", "error");
    }
  };

  const tabs = [
    { id: "requests", label: "Requests", badge: incoming.length },
    { id: "sent", label: "Sent" },
    { id: "matches", label: "Matches" },
  ];

  if (loading) {
    return (
      <div className="mt-20 text-center text-charcoalMuted">Loading...</div>
    );
  }

  return (
    <PageMotion className="p-4 pb-24">
      <div className="mb-4 flex gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex h-11 flex-1 items-center justify-center rounded-full font-body text-sm transition-all ${
              activeTab === tab.id
                ? "bg-orange text-white shadow-md"
                : "border border-charcoalMuted/30 bg-white text-charcoalMuted"
            }`}
          >
            {tab.label}
            {tab.badge > 0 && (
              <span
                className={`ml-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                  activeTab === tab.id
                    ? "bg-white text-orange"
                    : "bg-orange text-white"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "requests" && (
        <div>
          {incoming.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <Inbox size={48} className="text-charcoalMuted" />
              <p className="mt-4 font-heading text-xl text-charcoal">No requests yet</p>
              <p className="mt-2 font-body text-charcoalMuted">
                When someone sends you a request it appears here
              </p>
            </div>
          ) : (
            incoming.map((req) => {
              const sender = req.sentBy;
              const senderStats = senderRatings[String(sender._id)];
              return (
                <div
                  key={req._id}
                  className="request-glow relative mb-3 overflow-hidden rounded-xl border border-[#e9ddd1] border-l-[3px] border-l-orange bg-warmWhite p-4 shadow-sm"
                >
                  {senderStats?.count > 0 && (
                    <span className="absolute right-3 top-3 rounded-full bg-tealLight px-2 py-0.5 text-xs font-medium text-teal">
                      ★ {senderStats.average.toFixed(1)}
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orangeLight">
                      <User className="h-6 w-6 text-teal" />
                    </div>
                    <div className={`min-w-0 flex-1 ${senderStats?.count > 0 ? "pr-16" : ""}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-heading font-bold text-charcoal">{sender.name}</p>
                        {sender.verified && <BadgeCheck size={16} className="text-teal" />}
                        {sender.category && (
                          <span className="rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
                            {sender.category}
                          </span>
                        )}
                      </div>
                      {sender.location?.area && (
                        <div className="mt-2 flex items-center gap-1.5 text-sm text-charcoalMuted">
                          <MapPin size={14} className="text-teal" />
                          {sender.location.area}
                          {sender.location.city ? `, ${sender.location.city}` : ""}
                        </div>
                      )}
                      {sender.time && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-charcoalMuted">
                          <Clock size={14} className="text-teal" />
                          {sender.time}
                        </div>
                      )}
                      {formatWages(sender.wages) && (
                        <div className="mt-1 flex items-center gap-1.5 text-sm text-charcoalMuted">
                          <IndianRupee size={14} className="text-teal" />
                          {formatWages(sender.wages)}
                        </div>
                      )}
                      {req.message && (
                        <p className="mt-2 line-clamp-2 text-sm italic text-charcoalMuted">
                          &ldquo;{req.message}&rdquo;
                        </p>
                      )}
                      <p className="mt-2 text-xs text-charcoalMuted">
                        Sent {formatTimeAgo(req.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleRespond(req._id, "reject", sender)}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl border border-alert font-body text-sm text-alert"
                    >
                      <X size={16} />
                      Decline
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRespond(req._id, "accept", sender)}
                      className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded-xl bg-success font-body text-sm text-white"
                    >
                      <CheckCircle size={16} />
                      Accept
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "sent" && (
        <div>
          {outgoing.length === 0 ? (
            <div className="mt-16 flex flex-col items-center text-center">
              <SendHorizonal size={48} className="text-charcoalMuted" />
              <p className="mt-4 font-heading text-xl text-charcoal">No sent requests</p>
              <p className="mt-2 font-body text-charcoalMuted">
                Tap &apos;Request&apos; on any profile card to send a request
              </p>
            </div>
          ) : (
            outgoing.map((req) => {
              const recipient = req.sentTo;
              const statusPill =
                req.status === "pending"
                  ? "bg-orangeLight text-orange"
                  : req.status === "accepted"
                    ? "bg-success/10 text-success"
                    : "bg-gray-100 text-charcoalMuted";
              const matchId = getMatchIdForUser(recipient._id);

              return (
                <div
                  key={req._id}
                  className="mb-3 overflow-hidden rounded-xl border border-[#e9ddd1] border-l-[3px] border-l-teal bg-warmWhite"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orangeLight">
                          <User className="h-5 w-5 text-teal" />
                        </div>
                        <div>
                          <p className="font-heading font-bold text-charcoal">{recipient.name}</p>
                          {recipient.category && (
                            <span className="rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
                              {recipient.category}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-1 text-xs ${statusPill}`}>
                        {req.status === "pending" && "⏳ Pending"}
                        {req.status === "accepted" && "✓ Accepted"}
                        {req.status === "rejected" && "✗ Declined"}
                      </span>
                    </div>
                    {req.status === "accepted" && matchId && (
                      <button
                        type="button"
                        onClick={() =>
                          navigate(`/dashboard/${user.role}/messages/${matchId}`, {
                            state: {
                              otherPerson: {
                                _id: recipient._id,
                                name: recipient.name,
                                category: recipient.category,
                                role: recipient.role,
                              },
                            },
                          })
                        }
                        className="mt-3 rounded-xl border border-teal px-3 py-1.5 font-body text-sm text-teal"
                      >
                        Message
                      </button>
                    )}
                  </div>
                  {req.status === "accepted" && (
                    <>
                      <div className="bg-success py-1 text-center text-sm text-white">
                        Connected ✓
                      </div>
                      {matchId && (
                        <MatchRatingAction
                          matchId={matchId}
                          otherUser={{
                            _id: recipient._id,
                            name: recipient.name,
                          }}
                          userId={user._id}
                          ratingStatus={ratingStatus}
                          onOpenModal={openRatingModal}
                        />
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === "matches" && (
        <div>
          {matches.length === 0 ? (
            <div className="mt-16 text-center">
              <p className="font-heading text-xl text-charcoal">No matches yet</p>
              <p className="mt-2 font-body text-charcoalMuted">
                Swipe to match or accept a request!
              </p>
            </div>
          ) : (
            matches.map((match) => (
              <div
                key={match.matchId || match._id}
                className="mb-3 overflow-hidden rounded-xl border border-orangeLight bg-warmWhite"
              >
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orangeLight">
                    <User className="h-6 w-6 text-teal" />
                  </div>
                  <div className="min-w-0 flex-1">
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
                    className="rounded-xl border border-teal px-3 py-1.5 font-body text-sm text-teal"
                  >
                    Message
                  </button>
                </div>
                <div className="bg-success py-1 text-center text-sm text-white">
                  Connected ✓
                </div>
                <MatchRatingAction
                  matchId={match.matchId}
                  otherUser={{ _id: match._id, name: match.name }}
                  userId={user._id}
                  ratingStatus={ratingStatus}
                  onOpenModal={openRatingModal}
                />
              </div>
            ))
          )}
        </div>
      )}

      {ratingModal && (
        <RatingModal
          matchId={ratingModal.matchId}
          ratedUser={ratingModal.otherUser}
          onClose={() => setRatingModal(null)}
          onSubmitted={(stars) => handleRated(ratingModal.matchId, stars)}
        />
      )}
    </PageMotion>
  );
}

export default MatchesPage;
