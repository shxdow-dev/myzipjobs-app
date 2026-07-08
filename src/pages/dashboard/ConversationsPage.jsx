import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, MessageCircle, User } from "lucide-react";
import AuthContext from "../../context/AuthContext";
import { getConversations } from "../../services/api.js";

function formatTimeAgo(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hr ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function ConversationsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?._id) return;

    getConversations(user._id)
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="mt-20 flex flex-col items-center gap-3 text-charcoalMuted">
        <Loader2 size={32} className="animate-spin text-teal" />
        Loading conversations...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="mt-20 flex flex-col items-center text-center">
        <MessageCircle size={56} className="text-charcoalMuted" />
        <p className="mt-4 font-heading text-xl text-charcoal">
          No conversations yet
        </p>
        <p className="mt-2 font-body text-charcoalMuted">
          Match with someone to start chatting!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-heading text-2xl font-bold text-charcoal">
        Messages
      </h1>

      {conversations.map((conversation) => (
        <button
          key={conversation.matchId}
          type="button"
          onClick={() =>
            navigate(
              `/dashboard/${user.role}/messages/${conversation.matchId}`,
              { state: { otherPerson: conversation.otherPerson } }
            )
          }
          className="mb-3 flex w-full items-center gap-3 rounded-xl border border-[#e9ddd1] bg-warmWhite p-3 text-left transition-colors hover:bg-orangeLight/30"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orangeLight">
            <User className="h-6 w-6 text-teal" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="font-heading font-bold text-charcoal">
              {conversation.otherPerson.name}
            </p>
            {conversation.otherPerson.category && (
              <span className="mt-1 inline-block rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
                {conversation.otherPerson.category}
              </span>
            )}
            {conversation.lastMessage && (
              <>
                <p className="mt-1 truncate font-body text-sm text-charcoalMuted">
                  {conversation.lastMessage.text.slice(0, 40)}
                  {conversation.lastMessage.text.length > 40 ? "…" : ""}
                </p>
                <p className="mt-0.5 text-xs text-charcoalMuted">
                  {formatTimeAgo(conversation.lastMessage.createdAt)}
                </p>
              </>
            )}
          </div>

          {conversation.unreadCount > 0 && (
            <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange px-2 text-xs font-medium text-white">
              {conversation.unreadCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

export default ConversationsPage;
