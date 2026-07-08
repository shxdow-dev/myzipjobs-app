import {
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ArrowLeft, Send, User } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import {
  getConversations,
  getMessages,
  sendMessage,
} from "../../services/api.js";
import socket from "../../services/socket.js";

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
      <div className="ml-auto h-10 w-2/5 animate-pulse rounded-2xl bg-gray-200" />
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

  const handleSend = async () => {
    const trimmed = text.trim();
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const getSenderId = (message) =>
    String(message.senderId?._id || message.senderId);

  return (
    <div className="flex h-screen flex-col bg-warmWhite">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#e9ddd1] bg-warmWhite px-4 py-3">
        <button
          type="button"
          aria-label="Back to conversations"
          onClick={() => navigate(`/dashboard/${role}/messages`)}
          className="rounded-lg p-2 text-charcoal transition-colors hover:bg-orangeLight"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orangeLight">
          <User size={18} className="text-teal" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading font-bold text-charcoal">
            {otherPerson?.name || "Chat"}
          </p>
          {otherPerson?.category && (
            <span className="rounded-full bg-tealLight px-2 py-0.5 text-xs text-teal">
              {otherPerson.category}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <ChatSkeleton />
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
                        className={`px-4 py-2.5 ${
                          isSent
                            ? "rounded-2xl rounded-br-sm bg-orange text-white"
                            : "rounded-2xl rounded-bl-sm border border-[#e9ddd1] bg-white text-charcoal"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words font-body text-sm">
                          {message.text}
                        </p>
                      </div>
                      <p
                        className={`mt-1 text-xs ${
                          isSent ? "text-right text-orange/70" : "text-charcoalMuted"
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

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e9ddd1] bg-warmWhite p-3">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange text-white transition-all hover:bg-orangeDark disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
