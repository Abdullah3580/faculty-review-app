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
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConv = convs.find((c) => c.id === activeId) || null;

  const labelFor = (c: Conv) =>
    c.other?.role?.toUpperCase() === "ADMIN" && !isAdmin
      ? "Admin"
      : c.other?.name || c.other?.nickname || "User";

  const loadConvs = useCallback(async () => {
    const res = await fetch("/api/messages");
    if (!res.ok) return;
    const data = await res.json();
    setConvs(data.conversations);
  }, []);

  const loadMessages = useCallback(async (id: string) => {
    const res = await fetch(`/api/messages/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages);
  }, []);

  // প্রথমবার load + প্রতি ৫ সেকেন্ডে refresh
  useEffect(() => {
    if (!myId) return;
    loadConvs();
    const t = setInterval(() => {
      if (document.visibilityState === "visible") {
        loadConvs();
        if (activeId) loadMessages(activeId);
      }
    }, 5000);
    return () => clearInterval(t);
  }, [myId, activeId, loadConvs, loadMessages]);

  // student হলে প্রথম conversation নিজে থেকে খুলবে
  useEffect(() => {
    if (!isAdmin && !activeId && convs.length > 0) setActiveId(convs[0].id);
  }, [isAdmin, activeId, convs]);

  useEffect(() => {
    if (activeId) loadMessages(activeId);
    else setMessages([]);
  }, [activeId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const canCompose = isAdmin ? !!activeConv : true;

  const send = async () => {
    const content = text.trim();
    if (!content || sending || !canCompose) return;
    setSending(true);
    setError("");
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
        setError(data.error || "Could not send message.");
        return;
      }
      setText("");
      setActiveId(data.conversationId);
      await loadMessages(data.conversationId);
      await loadConvs();
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-4">
        💬 Messages
      </h1>

      <div className="flex h-[70vh] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-900">
        {/* Conversation list */}
        <div
          className={`${activeId ? "hidden md:block" : "block"} w-full md:w-72 shrink-0 border-r border-gray-200 dark:border-gray-800 overflow-y-auto`}
        >
          {convs.length === 0 && (
            <p className="p-4 text-sm text-gray-500">
              {isAdmin ? "No conversations yet." : "Write a message below to contact the admin."}
            </p>
          )}
          {convs.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-indigo-50 dark:hover:bg-gray-800 ${
                c.id === activeId ? "bg-indigo-50 dark:bg-gray-800" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {labelFor(c)}
                </span>
                {c.unread > 0 && (
                  <span className="ml-2 text-[10px] bg-red-500 text-white rounded-full px-2 py-0.5 font-bold">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                {c.lastMessage?.content || "No messages"}
              </p>
            </button>
          ))}
        </div>

        {/* Chat area */}
        <div className={`${activeId || !isAdmin ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0`}>
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3">
            <button
              onClick={() => setActiveId(null)}
              className="md:hidden text-indigo-600 font-bold"
            >
              ←
            </button>
            <span className="font-bold text-gray-900 dark:text-white">
              {activeConv ? labelFor(activeConv) : isAdmin ? "Select a conversation" : "Admin"}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {messages.map((m) => {
              const mine = m.senderId === myId;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words ${
                      mine
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {canCompose && (
            <div className="p-3 border-t border-gray-200 dark:border-gray-800">
              {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
              <div className="flex gap-2">
                <textarea
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
                  className="flex-1 resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500"
                />
                <button
                  onClick={send}
                  disabled={sending || !text.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}