"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Conv = {
  id: string;
  updatedAt: string;
  other: { id: string; nickname: string | null; role: string; name?: string | null } | null;
  lastMessage: { content: string; createdAt: string; senderId: string } | null;
  unread: number;
};
type Msg = { id: string; content: string; createdAt: string; senderId: string };

const GROUP_GAP = 5 * 60 * 1000;

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function listTime(iso: string) {
  const d = new Date(iso);
  if (d.toDateString() === new Date().toDateString()) return timeLabel(iso);
  return d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function Avatar({ label, admin, small }: { label: string; admin?: boolean; small?: boolean }) {
  const size = small ? "w-9 h-9 text-sm" : "w-11 h-11 text-base";
  return (
    <div
      className={`${size} shrink-0 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
        admin
          ? "bg-gradient-to-br from-amber-500 to-orange-600"
          : "bg-gradient-to-br from-indigo-500 to-purple-600"
      }`}
    >
      {admin ? "🛡️" : label.charAt(0).toUpperCase() || "U"}
    </div>
  );
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const myId = session?.user?.id;
  const isAdmin = session?.user?.role?.toUpperCase() === "ADMIN";

  const [convs, setConvs] = useState<Conv[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const activeRef = useRef<string | null>(null);
  activeRef.current = activeId;
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const activeConv = convs.find((c) => c.id === activeId) || null;

  const labelFor = (c: Conv) =>
    c.other?.role?.toUpperCase() === "ADMIN" && !isAdmin
      ? "Admin"
      : c.other?.name || c.other?.nickname || "User";

  const isAdminConv = (c: Conv | null) => c?.other?.role?.toUpperCase() === "ADMIN";

  const loadConvs = useCallback(async () => {
    try {
      const res = await fetch("/api/messages");
      if (!res.ok) return;
      const data = await res.json();
      setConvs(data.conversations);
    } catch {}
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/messages/${id}`);
      if (!res.ok) return;
      const data = await res.json();
      if (activeRef.current !== id) return;
      setMessages(data.messages);
    } catch {}
  }, []);

  // প্রথমবার load + প্রতি ৫ সেকেন্ডে refresh
  useEffect(() => {
    if (!myId) return;
    loadConvs();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadConvs();
        if (activeRef.current) loadMessages(activeRef.current);
      }
    }, 5000);
    return () => clearInterval(t);
  }, [myId, loadConvs, loadMessages]);

  // student হলে একমাত্র conversation নিজে থেকে খুলবে
  useEffect(() => {
    if (!isAdmin && !activeId && convs.length > 0) setActiveId(convs[0].id);
  }, [isAdmin, activeId, convs]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  // শুধু chat-এর অংশ নিচে যাবে
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, activeId]);

  // textarea নিজে থেকে বড় হবে
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  const canCompose = isAdmin ? !!activeConv : true;

  const send = async () => {
    const content = text.trim();
    if (!content || sending || !canCompose || !myId) return;
    setSending(true);
    setError("");

    const tempId = `tmp-${Date.now()}`;
    if (activeId) {
      setMessages((p) => [
        ...p,
        { id: tempId, content, createdAt: new Date().toISOString(), senderId: myId },
      ]);
    }
    setText("");

    const revert = (msg: string) => {
      setMessages((p) => p.filter((m) => m.id !== tempId));
      setText(content);
      setError(msg);
    };

    try {
      const body: { content: string; toUserId?: string } = { content };
      if (isAdmin) body.toUserId = activeConv?.other?.id;
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        revert(data.error || "Could not send message.");
        return;
      }
      activeRef.current = data.conversationId;
      setActiveId(data.conversationId);
      await loadMessages(data.conversationId);
      await loadConvs();
    } catch {
      revert("Network error. Please try again.");
    } finally {
      setSending(false);
    }
  };

  if (status === "loading") {
    return <div className="p-10 text-center text-gray-500">Loading...</div>;
  }
  if (!session) {
    return (
      <div className="p-10 text-center">
        <Link href="/login" className="text-indigo-600 font-bold hover:underline">
          Login to see your messages
        </Link>
      </div>
    );
  }

  const q = search.trim().toLowerCase();
  const shownConvs = q
    ? convs.filter((c) => labelFor(c).toLowerCase().includes(q) || c.other?.nickname?.toLowerCase().includes(q))
    : convs;

  const headerTitle = activeConv ? labelFor(activeConv) : isAdmin ? "Select a conversation" : "Admin";
  const headerAdmin = activeConv ? isAdminConv(activeConv) : !isAdmin;

  return (
    <div className="max-w-5xl mx-auto p-3 md:p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4 px-1">
        💬 Messages
      </h1>

      <div className="flex h-[calc(100dvh-11rem)] min-h-[420px] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900 shadow-lg">
        {/* Conversation list (শুধু admin-এর জন্য) */}
        {isAdmin && (
          <div
            className={`${activeId ? "hidden md:flex" : "flex"} w-full md:w-80 shrink-0 flex-col border-r border-gray-200 dark:border-gray-800`}
          >
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full rounded-xl bg-gray-100 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {shownConvs.length === 0 && (
                <p className="p-6 text-sm text-gray-500 text-center">
                  {q ? "No match found." : "No conversations yet. Start one from the Admin Dashboard."}
                </p>
              )}
              {shownConvs.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800/60 hover:bg-indigo-50/70 dark:hover:bg-gray-800 transition ${
                    c.id === activeId ? "bg-indigo-50 dark:bg-gray-800" : ""
                  }`}
                >
                  <Avatar label={labelFor(c)} admin={isAdminConv(c)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-center gap-2">
                      <span
                        className={`text-sm truncate text-gray-900 dark:text-white ${
                          c.unread > 0 ? "font-extrabold" : "font-semibold"
                        }`}
                      >
                        {labelFor(c)}
                      </span>
                      {c.lastMessage && (
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {listTime(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center gap-2 mt-0.5">
                      <p
                        className={`text-xs truncate ${
                          c.unread > 0
                            ? "text-gray-900 dark:text-gray-100 font-medium"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {c.lastMessage?.content || "No messages"}
                      </p>
                      {c.unread > 0 && (
                        <span className="text-[10px] bg-red-500 text-white rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center font-bold shrink-0">
                          {c.unread > 9 ? "9+" : c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat area */}
        <div
          className={`${isAdmin && !activeId ? "hidden md:flex" : "flex"} flex-1 flex-col min-w-0`}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => setActiveId(null)}
                className="md:hidden text-indigo-600 dark:text-indigo-400 font-bold text-lg px-1"
                aria-label="Back"
              >
                ←
              </button>
            )}
            {(activeConv || !isAdmin) && <Avatar label={headerTitle} admin={headerAdmin} small />}
            <div className="min-w-0">
              <p className="font-bold text-gray-900 dark:text-white truncate leading-tight">
                {headerTitle}
              </p>
              {activeConv?.other?.nickname && isAdmin && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  @{activeConv.other.nickname}
                </p>
              )}
              {!isAdmin && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Contact the site admin
                </p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-3 md:px-5 py-4 bg-gray-50/60 dark:bg-gray-950/40"
          >
            {!activeConv && isAdmin ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <span className="text-5xl mb-3">💬</span>
                <p className="text-sm">Select a conversation to start chatting.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400">
                <span className="text-5xl mb-3">👋</span>
                <p className="text-sm">
                  {isAdmin ? "No messages yet." : "No messages yet. Say hello to the admin!"}
                </p>
              </div>
            ) : (
              messages.map((m, i) => {
                const prev = messages[i - 1];
                const next = messages[i + 1];
                const mine = m.senderId === myId;
                const newDay =
                  !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                const joinsPrev =
                  !!prev &&
                  !newDay &&
                  prev.senderId === m.senderId &&
                  new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_GAP;
                const lastInGroup =
                  !next ||
                  next.senderId !== m.senderId ||
                  new Date(next.createdAt).toDateString() !== new Date(m.createdAt).toDateString() ||
                  new Date(next.createdAt).getTime() - new Date(m.createdAt).getTime() > GROUP_GAP;

                return (
                  <div key={m.id}>
                    {newDay && (
                      <div className="flex justify-center my-4">
                        <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 bg-gray-200/70 dark:bg-gray-800 px-3 py-1 rounded-full">
                          {dayLabel(m.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`flex flex-col ${mine ? "items-end" : "items-start"} ${
                        joinsPrev ? "mt-0.5" : "mt-3"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] md:max-w-[70%] px-3.5 py-2 text-sm whitespace-pre-wrap break-words shadow-sm ${
                          mine
                            ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl " +
                              (lastInGroup ? "rounded-br-md" : "")
                            : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-2xl " +
                              (lastInGroup ? "rounded-bl-md" : "")
                        } ${m.id.startsWith("tmp-") ? "opacity-70" : ""}`}
                      >
                        {m.content}
                      </div>
                      {lastInGroup && (
                        <span className="text-[10px] text-gray-400 mt-1 px-1">
                          {timeLabel(m.createdAt)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Composer */}
          {canCompose && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              {error && <p className="text-xs text-red-500 mb-2 px-1">{error}</p>}
              <div className="flex items-end gap-2">
                <textarea
                  ref={taRef}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                  rows={1}
                  maxLength={2000}
                  placeholder="Type a message..."
                  className="flex-1 resize-none rounded-2xl bg-gray-100 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500/40 max-h-[120px]"
                />
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  aria-label="Send"
                  className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition disabled:opacity-40 disabled:hover:scale-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10l12 2-12 2z" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between px-2 mt-1.5">
                <span className="text-[10px] text-gray-400">
                  Enter to send, Shift + Enter for a new line
                </span>
                {text.length > 1800 && (
                  <span className="text-[10px] text-gray-400">{text.length}/2000</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}