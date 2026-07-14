import { useContext, useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Loader2, MessageCircle, User } from "lucide-react";
import PageMotion from "../../components/common/PageMotion";
import AuthContext from "../../context/AuthContext";
import { getConversations } from "../../services/api.js";

function formatConversationTime(dateString) {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  }
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) {
    return date.toLocaleDateString("en-IN", { weekday: "short" });
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function ConversationsPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { refreshUnreadCount } = useOutletContext() || {};
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    refreshUnreadCount?.();
  }, [refreshUnreadCount]);

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
      <PageMotion className="mt-20 flex flex-col items-center pb-24 text-center">
        <MessageCircle size={56} className="text-charcoalMuted" />
        <p className="mt-4 font-heading text-xl text-charcoal">No conversations yet</p>
        <p className="mt-2 font-body text-charcoalMuted">
          Match with someone to start chatting!
        </p>
      </PageMotion>
    );
  }

  return (
    <PageMotion className="pb-24">
      {conversations.map((conversation) => {
        const hasUnread = conversation.unreadCount > 0;
        return (
          <button
            key={conversation.matchId}
            type="button"
            onClick={() =>
              navigate(
                `/dashboard/${user.role}/messages/${conversation.matchId}`,
                { state: { otherPerson: conversation.otherPerson } }
              )
            }
            className="mb-3 flex w-full items-center gap-3 rounded-xl border border-[#e9ddd1] bg-white p-3 text-left transition-colors hover:bg-orangeLight/30 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700/50"
          >
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orangeLight">
              <User className="h-6 w-6 text-teal" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-warmWhite bg-success" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p
                  className={`font-heading text-charcoal dark:text-white ${hasUnread ? "font-bold" : "font-bold"}`}
                >
                  {conversation.otherPerson.name}
                </p>
                {hasUnread && (
                  <span className="h-2 w-2 shrink-0 rounded-full bg-orange" />
                )}
              </div>
              {conversation.otherPerson.category && (
                <span className="mt-0.5 inline-block rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
                  {conversation.otherPerson.category}
                </span>
              )}
              {conversation.lastMessage && (
                <>
                  <p
                    className={`mt-1 truncate font-body text-sm ${
                      hasUnread
                        ? "font-semibold text-charcoal dark:text-white"
                        : "text-charcoalMuted dark:text-gray-400"
                    }`}
                  >
                    {conversation.lastMessage.text.slice(0, 40)}
                    {conversation.lastMessage.text.length > 40 ? "…" : ""}
                  </p>
                  <p className="mt-0.5 text-xs text-charcoalMuted">
                    {formatConversationTime(conversation.lastMessage.createdAt)}
                  </p>
                </>
              )}
            </div>

            {hasUnread && (
              <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-orange px-2 text-xs font-medium text-white">
                {conversation.unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </PageMotion>
  );
}

export default ConversationsPage;
