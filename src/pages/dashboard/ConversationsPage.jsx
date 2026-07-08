import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageCircle, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getConversations } from "../../services/api";

function formatTimeAgo(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (isToday) return `${diffHr || 1} hr ago`;
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function truncate(text, max = 40) {
  if (!text) return "No messages yet";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function ConversationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    getConversations(user._id)
      .then((data) => setConversations(Array.isArray(data) ? data : []))
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, [user?._id]);

  if (loading) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
        <Loader2 size={32} className="animate-spin text-teal" />
        <p className="font-body text-charcoalMuted">Loading conversations...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <MessageCircle size={48} className="text-charcoalMuted" />
        <p className="mt-4 font-heading text-xl font-bold text-charcoal">
          No conversations yet
        </p>
        <p className="mt-2 font-body text-charcoalMuted">
          Match with someone to start chatting!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-charcoal">Messages</h1>

      <div className="mt-6 space-y-3">
        {conversations.map(({ matchId, otherPerson, lastMessage, unreadCount }) => (
          <button
            key={matchId}
            type="button"
            onClick={() =>
              navigate(`/dashboard/${user.role}/messages/${matchId}`)
            }
            className="flex w-full items-center gap-3 rounded-xl border border-[#e9ddd1] bg-warmWhite p-3 text-left transition-colors hover:bg-orangeLight/30"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orangeLight">
              <User size={24} className="text-teal" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-heading text-base font-bold text-charcoal">
                {otherPerson.name}
              </p>
              {otherPerson.category && (
                <span className="mt-0.5 inline-block rounded-full bg-tealLight px-2 py-0.5 font-body text-xs text-teal">
                  {otherPerson.category}
                </span>
              )}
              <p className="mt-1 truncate font-body text-sm text-charcoalMuted">
                {truncate(lastMessage?.text)}
              </p>
              {lastMessage?.createdAt && (
                <p className="mt-0.5 font-body text-xs text-charcoalMuted">
                  {formatTimeAgo(lastMessage.createdAt)}
                </p>
              )}
            </div>

            {unreadCount > 0 && (
              <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-orange px-1.5 font-body text-xs font-medium text-white">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ConversationsPage;
