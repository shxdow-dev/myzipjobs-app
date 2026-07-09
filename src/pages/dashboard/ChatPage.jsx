import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, Send, ShieldAlert, User } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import SOSModal from "../../components/safety/SOSModal";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../../services/api.js";
import socket from "../../services/socket.js";

const QUICK_REPLIES = [
  "Hi! I'm interested in working with you",
  "Hello! When are you available?",
  "Hi! Can we discuss the details?",
];

function formatTime(dateString) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDateLabel(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function isSameDay(a, b) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function ChatSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-gray-200" />
      <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-gray-200" />
      <div className="h-10 w-3/5 animate-pulse rounded-2xl bg-gray-200" />
    </div>
  );
}

function ChatPage({ role }) {
  const { matchId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [otherPerson, setOtherPerson] = useState(
    location.state?.otherPerson || null
  );
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendPulse, setSendPulse] = useState(false);
  const [showSOSModal, setShowSOSModal] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!user?._id || !matchId) return;

    getMessages(matchId, user._id)
      .then((data) => {
        setMessages(Array.isArray(data) ? data : []);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      })
      .catch(() => setLoading(false));

    if (!location.state?.otherPerson) {
      getConversations(user._id).then((data) => {
        const conversation = (Array.isArray(data) ? data : []).find(
          (item) => String(item.matchId) === String(matchId)
        );
        if (conversation?.otherPerson) {
          setOtherPerson(conversation.otherPerson);
        }
      });
    }
  }, [user?._id, matchId, location.state?.otherPerson]);

  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinRoom", matchId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        const exists = prev.some(
          (item) => String(item._id) === String(msg._id)
        );
        if (exists) return prev;
        const withoutTemp = prev.filter(
          (item) =>
            !(
              item._temp &&
              item.text === msg.text &&
              String(item.senderId?._id || item.senderId) ===
                String(msg.senderId?._id || msg.senderId)
            )
        );
        return [...withoutTemp, msg];
      });
      setTimeout(scrollToBottom, 50);
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", matchId);
      socket.off("newMessage", handleNewMessage);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const sendText = async (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed || !user?._id || !otherPerson?._id || sending) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      _temp: true,
      matchId,
      senderId: { _id: user._id, name: user.name },
      receiverId: otherPerson._id,
      text: trimmed,
      read: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    setSending(true);
    setSendPulse(true);
    setTimeout(() => setSendPulse(false), 300);
    inputRef.current?.focus();
    scrollToBottom();

    try {
      const saved = await sendMessage(
        matchId,
        user._id,
        otherPerson._id,
        trimmed
      );
      setMessages((prev) =>
        prev.map((item) => (item._id === tempId ? saved : item))
      );
    } catch {
      setMessages((prev) => prev.filter((item) => item._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const handleSend = () => sendText(text);

  const handleInputChange = (event) => {
    setText(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const getSenderId = (message) =>
    String(message.senderId?._id || message.senderId);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-warmWhite">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#e9ddd1] bg-warmWhite px-4 py-3">
        <button
          type="button"
          aria-label="Back to conversations"
          onClick={() => navigate(`/dashboard/${role}/messages`)}
          className="rounded-lg p-2 text-charcoal transition-colors hover:bg-orangeLight"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orangeLight">
          <User size={18} className="text-teal" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-bold text-charcoal">
            {otherPerson?.name || "Chat"}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="font-body text-xs text-success">Online</span>
          </div>
        </div>

        <button
          type="button"
          aria-label="Report safety concern"
          onClick={() => setShowSOSModal(true)}
          className="rounded-lg border border-alert p-2 text-alert transition hover:bg-alert/5"
        >
          <ShieldAlert className="h-5 w-5" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-40">
        {loading ? (
          <ChatSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orangeLight">
              <User className="h-8 w-8 text-teal" />
            </div>
            <p className="mt-4 font-heading text-lg font-bold text-charcoal">
              You matched with {otherPerson?.name || "them"}!
            </p>
            <p className="mt-1 font-body text-charcoalMuted">Say hello 👋</p>
            <div className="mt-6 flex w-full max-w-sm flex-col gap-2">
              {QUICK_REPLIES.map((reply) => (
                <button
                  key={reply}
                  type="button"
                  onClick={() => sendText(reply)}
                  className="rounded-full bg-tealLight px-4 py-2 font-body text-sm text-teal transition hover:brightness-95"
                >
                  {reply}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3 p-4">
            {messages.map((message, index) => {
              const isSent = getSenderId(message) === String(user._id);
              const showDateSeparator =
                index === 0 ||
                !isSameDay(messages[index - 1].createdAt, message.createdAt);

              return (
                <div key={message._id}>
                  {showDateSeparator && (
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-[#e9ddd1]" />
                      <span className="text-xs text-charcoalMuted">
                        {formatDateLabel(message.createdAt)}
                      </span>
                      <div className="h-px flex-1 bg-[#e9ddd1]" />
                    </div>
                  )}

                  <div
                    className={`flex ${isSent ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`px-4 py-2.5 shadow-sm ${
                          isSent
                            ? "rounded-2xl rounded-br-sm bg-gradient-to-br from-orange to-orangeDark text-white"
                            : "rounded-2xl rounded-bl-sm border border-[#e9ddd1] bg-white text-charcoal"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words font-body text-sm">
                          {message.text}
                        </p>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isSent ? "text-right text-charcoalMuted" : "text-charcoalMuted"
                        }`}
                      >
                        {formatTime(message.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-16 left-0 right-0 z-30 border-t border-[#e9ddd1] bg-warmWhite p-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-charcoalMuted bg-warmWhite px-4 py-2.5 font-body text-charcoal outline-none focus:border-teal focus:ring-1 focus:ring-tealLight"
          />
          <button
            type="button"
            aria-label="Send message"
            disabled={!text.trim() || sending}
            onClick={handleSend}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange text-white transition-all hover:bg-orangeDark disabled:cursor-not-allowed disabled:opacity-50 ${sendPulse ? "scale-110" : ""}`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>

      {showSOSModal && (
        <SOSModal
          matchId={matchId}
          otherUser={otherPerson}
          onClose={() => setShowSOSModal(false)}
        />
      )}
    </div>
  );
}

export default ChatPage;
