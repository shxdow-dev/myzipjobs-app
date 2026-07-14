import {
  Bell,
  CheckCircle,
  Heart,
  MessageCircle,
  SendHorizonal,
  Zap,
} from "lucide-react";

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

function NotificationIcon({ type }) {
  switch (type) {
    case "work_done":
      return <CheckCircle className="h-5 w-5 shrink-0 text-success" />;
    case "new_request":
      return <SendHorizonal className="h-5 w-5 shrink-0 text-teal" />;
    case "request_accepted":
    case "new_match":
      return <Heart className="h-5 w-5 shrink-0 text-orange" />;
    case "new_message":
      return <MessageCircle className="h-5 w-5 shrink-0 text-teal" />;
    default:
      return <Zap className="h-5 w-5 shrink-0 text-orange" />;
  }
}

function NotificationPanel({
  notifications,
  onNotificationClick,
  onMarkAllRead,
}) {
  return (
    <div className="absolute right-0 top-12 z-50 w-80 max-h-[400px] overflow-hidden rounded-2xl bg-warmWhite shadow-xl dark:bg-gray-800 dark:shadow-gray-900/50">
      <div className="flex items-center justify-between border-b border-[#e9ddd1] px-4 py-3 dark:border-gray-700">
        <h3 className="font-heading font-bold text-charcoal dark:text-white">Notifications</h3>
        <button
          type="button"
          onClick={onMarkAllRead}
          className="font-body text-xs text-teal hover:underline"
        >
          Mark all read
        </button>
      </div>

      <div className="max-h-[340px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center px-4 py-10 text-center">
            <Bell className="h-10 w-10 text-charcoalMuted" />
            <p className="mt-3 font-body text-sm text-charcoalMuted">
              No notifications yet
            </p>
          </div>
        ) : (
          notifications.map((notif) => (
            <button
              key={notif._id || `${notif.type}-${notif.createdAt}`}
              type="button"
              onClick={() => onNotificationClick(notif)}
              className="flex w-full items-start gap-3 border-b border-[#e9ddd1] px-3 py-3 text-left transition hover:bg-orangeLight dark:border-gray-700 dark:hover:bg-gray-700/50"
            >
              {!notif.read && (
                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-orange" />
              )}
              {notif.read && <span className="mt-2 h-2 w-2 shrink-0" />}
              <NotificationIcon type={notif.type} />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-sm font-bold text-charcoal dark:text-white">
                  {notif.title}
                </p>
                <p className="mt-0.5 font-body text-sm text-charcoalMuted dark:text-gray-400">
                  {notif.message}
                </p>
                <p className="mt-1 font-body text-xs text-charcoalMuted">
                  {formatTimeAgo(notif.createdAt)}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export default NotificationPanel;
