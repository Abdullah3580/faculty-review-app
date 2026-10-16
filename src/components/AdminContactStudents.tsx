// AdminContactStudents.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

type Student = {
  id: string;
  name: string | null;
  nickname: string | null;
  studentId: string | null;
  email: string | null;
};

export default function AdminContactStudents({ students }: { students: Student[] }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Student | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const q = search.trim().toLowerCase();
  const results = q
    ? students
        .filter((s) =>
          [s.name, s.nickname, s.studentId, s.email].some((v) =>
            v?.toLowerCase().includes(q)
          )
        )
        .slice(0, 8)
    : [];

  const send = async () => {
    const content = text.trim();
    if (!selected || !content || sending) return;
    setSending(true);
    setError("");
    setSent(false);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, toUserId: selected.id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send message.");
        return;
      }
      setText("");
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass-card p-6 rounded-xl">
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        💬 Contact Student
      </h2>

      {!selected ? (
        <>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, nickname, student ID or email..."
            className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500"
          />
          <div className="mt-3 space-y-1">
            {q && results.length === 0 && (
              <p className="text-sm text-gray-500">No student found.</p>
            )}
            {results.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelected(s);
                  setSent(false);
                  setError("");
                }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-gray-800 transition"
              >
                <span className="font-semibold text-sm text-gray-900 dark:text-white">
                  {s.name || s.nickname || "Unnamed"}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400">
                  {[s.studentId, s.email].filter(Boolean).join(" · ")}
                </span>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-700 dark:text-gray-200">
              To: <b>{selected.name || selected.nickname}</b>{" "}
              <span className="text-xs text-gray-500">({selected.email})</span>
            </p>
            <button
              onClick={() => {
                setSelected(null);
                setText("");
                setSent(false);
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Change
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Write your message..."
            className="w-full resize-none rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent px-3 py-2 text-sm text-gray-900 dark:text-white outline-none focus:border-indigo-500"
          />

          {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
          {sent && (
            <p className="text-xs text-green-600 mt-2">
              Message sent.{" "}
              <Link href="/messages" className="font-bold underline">
                Open conversation
              </Link>
            </p>
          )}

          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-bold disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Message"}
          </button>
        </>
      )}
    </div>
  );
}