import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getMatches, getMessages, sendMessage } from "../../services/api";
import socket from "../../services/socket";

function formatBubbleTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getDateKey(dateStr) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDateSeparator(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === now.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ChatSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6">
      <div className="flex justify-start">
        <div className="h-12 w-48 animate-pulse rounded-2xl rounded-bl-sm bg-[#e9ddd1]" />
      </div>
      <div className="flex justify-end">
        <div className="h-12 w-56 animate-pulse rounded-2xl rounded-br-sm bg-[#e9ddd1]" />
      </div>
      <div className="flex justify-start">
        <div className="h-10 w-40 animate-pulse rounded-2xl rounded-bl-sm bg-[#e9ddd1]" />
      </div>
      <div className="flex justify-end">
        <div className="h-14 w-52 animate-pulse rounded-2xl rounded-br-sm bg-[#e9ddd1]" />
      </div>
    </div>
  );
}

function ChatPage({ role }) {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [otherPerson, setOtherPerson] = useState(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/register");
      return;
    }
    if (user.role !== role) {
      navigate(`/dashboard/${user.role}/messages/${matchId}`);
    }
  }, [user, role, matchId, navigate]);

  useEffect(() => {
    if (!user?._id || !matchId) return;

    Promise.all([getMessages(matchId, user._id), getMatches(user._id)])
      .then(([msgs, matchData]) => {
        setMessages(Array.isArray(msgs) ? msgs : []);
        const match = (matchData.matches || []).find(
          (m) => String(m.matchId) === String(matchId)
        );
        setOtherPerson(match?.profile || null);
      })
      .catch(() => {
        setMessages([]);
      })
      .finally(() => setLoading(false));
  }, [matchId, user?._id]);

  useEffect(() => {
    if (!matchId) return;

    socket.emit("joinRoom", matchId);

    const handleNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.emit("leaveRoom", matchId);
      socket.off("newMessage", handleNewMessage);
    };
  }, [matchId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
    }
  };

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user?._id || !otherPerson?._id) return;

    const tempId = `temp-${Date.now()}`;
    const optimistic = {
      _id: tempId,
      matchId,
      senderId: { _id: user._id, name: user.name },
      receiverId: otherPerson._id,
      text: trimmed,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, optimistic]);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      const saved = await sendMessage(matchId, user._id, otherPerson._id, trimmed);
      setMessages((prev) =>
        prev.map((m) => (m._id === tempId ? saved : m))
      );
    } catch {
      setMessages((prev) => prev.filter((m) => m._id !== tempId));
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  const groupedMessages = [];
  let lastDateKey = null;

  messages.forEach((msg) => {
    const dateKey = getDateKey(msg.createdAt);
    if (dateKey !== lastDateKey) {
      groupedMessages.push({ type: "separator", date: msg.createdAt, key: dateKey });
      lastDateKey = dateKey;
    }
    groupedMessages.push({ type: "message", data: msg, key: msg._id });
  });

  return (
    <div className="flex h-screen flex-col bg-warmWhite">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#e9ddd1] bg-warmWhite px-3 py-3">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/${role}/messages`)}
          className="rounded-lg p-2 text-charcoal transition-colors hover:bg-orangeLight"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={22} />
        </button>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orangeLight">
          <User size={18} className="text-teal" />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-heading text-base font-bold text-charcoal">
            {otherPerson?.name || "Chat"}
          </p>
          {otherPerson?.category && (
            <span className="inline-block rounded-full bg-tealLight px-2 py-0.5 font-body text-xs text-teal">
              {otherPerson.category}
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-20">
        {loading ? (
          <ChatSkeleton />
        ) : (
          <div className="space-y-3 px-4 py-4">
            {groupedMessages.map((item) => {
              if (item.type === "separator") {
                return (
                  <div
                    key={`sep-${item.key}`}
                    className="flex items-center gap-3 py-2"
                  >
                    <div className="h-px flex-1 bg-[#e9ddd1]" />
                    <span className="font-body text-xs text-charcoalMuted">
                      {formatDateSeparator(item.date)}
                    </span>
                    <div className="h-px flex-1 bg-[#e9ddd1]" />
                  </div>
                );
              }

              const msg = item.data;
              const isSent =
                String(msg.senderId?._id || msg.senderId) === String(user._id);

              return (
                <div
                  key={item.key}
                  className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 ${
                      isSent
                        ? "rounded-2xl rounded-br-sm bg-orange text-white"
                        : "rounded-2xl rounded-bl-sm border border-[#e9ddd1] bg-white text-charcoal"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words font-body text-sm">
                      {msg.text}
                    </p>
                  </div>
                  <span
                    className={`mt-1 px-1 font-body text-xs ${
                      isSent ? "text-orange/70" : "text-charcoalMuted"
                    }`}
                  >
                    {formatBubbleTime(msg.createdAt)}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e9ddd1] bg-warmWhite p-3">
        <div className="mx-auto flex max-w-6xl items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-charcoalMuted px-4 py-2.5 font-body text-sm text-charcoal outline-none transition-colors focus:border-teal"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!text.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange text-white transition-opacity disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatPage;
