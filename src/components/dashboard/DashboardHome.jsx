import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, User } from "lucide-react";
import PageMotion from "../common/PageMotion";
import {
  Bell,
  Briefcase,
  Heart,
  MessageCircle,
  Search,
  Zap,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/api.js";

function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function DashboardSkeleton() {
  return (
    <div className="-mx-4">
      <div className="mx-4 mb-4 rounded-2xl bg-gray-200 p-5 animate-pulse">
        <div className="h-7 w-[200px] rounded-xl bg-gray-300" />
        <div className="mt-2 h-[18px] w-[280px] rounded-xl bg-gray-300" />
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-200" />
        ))}
      </div>
      <div className="mb-4 px-4">
        <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 flex gap-3 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 min-w-[140px] animate-pulse rounded-2xl bg-gray-200" />
          ))}
        </div>
      </div>
      <div className="space-y-3 px-4 pb-24">
        <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
        <div className="h-14 animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, iconClass, value, label, borderClass, highlight, highlightColor = "text-orange" }) {
  const numericValue = typeof value === "number" ? value : parseInt(value, 10);
  const isZero = numericValue === 0 || value === "0%";

  return (
    <div
      className={`rounded-2xl border border-orangeLight border-l-4 ${borderClass} bg-white p-4 transition hover:scale-[1.02] hover:shadow-md dark:border-gray-700 dark:bg-gray-800`}
    >
      <Icon className={`h-6 w-6 ${iconClass}`} />
      <p
        className={`mt-2 font-heading text-3xl font-bold ${
          highlight && !isZero
            ? highlightColor
            : isZero
              ? "text-charcoalMuted dark:text-gray-400"
              : "text-charcoal dark:text-white"
        }`}
      >
        {value}
      </p>
      <p className="font-body text-sm text-charcoalMuted dark:text-gray-400">{label}</p>
    </div>
  );
}

function DashboardHome({ role }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    if (!user?._id) return;
    const data = await getDashboardStats(user._id);
    setStats(data);
  }, [user?._id]);

  useEffect(() => {
    if (!user?._id) return;
    setLoading(true);
    fetchStats().finally(() => setLoading(false));
  }, [user?._id, fetchStats]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchStats();
    };
    window.addEventListener("refreshDashboardStats", handleRefresh);
    return () => window.removeEventListener("refreshDashboardStats", handleRefresh);
  }, [fetchStats]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const {
    totalMatches = 0,
    unreadMessages = 0,
    connectRate = "0%",
    incomingRequests = 0,
    recentMatches = [],
  } = stats || {};

  const timeOfDay = getTimeOfDay();
  const isWorker = role === "worker";
  const basePath = `/dashboard/${role}`;
  const showProfileHint = !user.about;

  const greetingSubtext =
    totalMatches > 0
      ? isWorker
        ? `You have ${totalMatches} match${totalMatches > 1 ? "es" : ""}. Keep going!`
        : `${totalMatches} worker${totalMatches > 1 ? "s" : ""} matched with you!`
      : isWorker
        ? "Start swiping to find employers near you."
        : "Start finding workers near you.";

  return (
    <PageMotion className="-mx-4">
      <div className="mx-4 mb-4 rounded-2xl bg-gradient-to-r from-orangeLight to-tealLight p-5 dark:from-gray-800 dark:to-gray-700">
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Good {timeOfDay}, {user.name} 👋
        </h1>
        <p className="mt-1 font-body text-charcoalMuted dark:text-gray-400">{greetingSubtext}</p>
      </div>

      {showProfileHint && (
        <button
          type="button"
          onClick={() => navigate(`${basePath}/profile/edit`)}
          className="mx-4 mb-4 w-[calc(100%-2rem)] rounded-xl bg-tealLight px-4 py-2.5 text-left font-body text-sm text-teal transition hover:brightness-95"
        >
          ✏️ Complete your profile to get more matches
        </button>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3 px-4 md:grid-cols-4">
        <StatCard
          icon={Heart}
          iconClass="text-orange"
          value={totalMatches}
          label="Matches"
          borderClass="border-orange"
          highlight={totalMatches > 0}
        />
        <StatCard
          icon={MessageCircle}
          iconClass="text-teal"
          value={unreadMessages}
          label="Unread"
          borderClass="border-teal"
          highlight={unreadMessages > 0}
          highlightColor="text-teal"
        />
        <StatCard
          icon={Zap}
          iconClass="text-orange"
          value={connectRate}
          label="Connect Rate"
          borderClass="border-orange"
        />
        <StatCard
          icon={Bell}
          iconClass="text-teal"
          value={incomingRequests}
          label="Requests"
          borderClass="border-alert"
          highlight={incomingRequests > 0}
        />
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="font-heading font-bold text-charcoal dark:text-white">Recent Matches</h2>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/matches`)}
            className="font-body text-sm text-teal"
          >
            View all
          </button>
        </div>

        {recentMatches.length === 0 ? (
          <p className="py-4 text-center font-body text-sm text-charcoalMuted dark:text-gray-400">
            No matches yet — start swiping!
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2">
            {recentMatches.map(({ matchId, profile }) => (
              <div
                key={matchId}
                className="min-w-[140px] rounded-2xl border border-orangeLight bg-white p-3 text-center dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orangeLight ring-2 ring-teal ring-offset-2">
                  <User className="h-7 w-7 text-teal" />
                </div>
                <p className="mx-auto mt-2 max-w-[120px] truncate font-heading text-sm font-bold text-charcoal dark:text-white">
                  {profile.name}
                </p>
                {profile.category && (
                  <span className="mt-1 inline-block rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
                    {profile.category}
                  </span>
                )}
                {profile.location?.area && (
                  <p className="mt-1 flex items-center justify-center gap-0.5 font-body text-xs text-charcoalMuted">
                    <MapPin size={10} className="text-teal" />
                    {profile.location.area}
                  </p>
                )}
                <p className="mt-0.5 text-xs text-charcoalMuted">Matched recently</p>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`${basePath}/messages/${matchId}`, {
                      state: {
                        otherPerson: {
                          _id: profile._id,
                          name: profile.name,
                          category: profile.category,
                          role: profile.role,
                        },
                      },
                    })
                  }
                  className="mt-2 w-full rounded-xl border border-teal px-2 py-1.5 font-body text-xs text-teal"
                >
                  Message
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pb-24">
        <h2 className="mb-3 font-heading font-bold text-charcoal dark:text-white">Quick Actions</h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/discover`)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange to-orangeDark font-heading text-white transition hover:brightness-95"
          >
            {isWorker ? (
              <>
                <Briefcase className="h-5 w-5" />
                Explore Jobs
              </>
            ) : (
              <>
                <Search className="h-5 w-5" />
                Find Workers
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate(`${basePath}/messages`)}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-teal font-heading text-white transition hover:brightness-95"
          >
            <MessageCircle className="h-5 w-5" />
            My Messages
          </button>
        </div>
      </div>
    </PageMotion>
  );
}

export default DashboardHome;
