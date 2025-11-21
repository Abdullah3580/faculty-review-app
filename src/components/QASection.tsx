// src/components/QASection.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  nickname: string | null;
  semester: string | null;
}

interface Answer {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
}

interface Question {
  id: string;
  content: string;
  createdAt: Date;
  user: User;
  answers: Answer[];
}

export default function QASection({ facultyId, questions, session }: { facultyId: string, questions: Question[], session: any }) {
  const [isOpen, setIsOpen] = useState(false); // Q/A সেকশন খোলা/বন্ধ রাখার জন্য
  const [newQuestion, setNewQuestion] = useState("");
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({}); // কোন প্রশ্নের উত্তরে কী লিখছেন
  const [replyOpen, setReplyOpen] = useState<{ [key: string]: boolean }>({}); // রিপ্লাই বক্স খোলা কিনা
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // প্রশ্ন সাবমিট করা
  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    setLoading(true);
    await fetch("/api/qa/question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facultyId, content: newQuestion }),
    });
    setNewQuestion("");
    setLoading(false);
    router.refresh();
  };

  // উত্তর সাবমিট করা
  const handlePostAnswer = async (questionId: string) => {
    if (!replyText[questionId]?.trim()) return;
    setLoading(true);
    await fetch("/api/qa/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId, content: replyText[questionId] }),
    });
    setReplyText({ ...replyText, [questionId]: "" });
    setReplyOpen({ ...replyOpen, [questionId]: false });
    setLoading(false);
    router.refresh();
  };

  return (
    <div className="mt-4 border-t border-gray-700 pt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-indigo-400 text-sm font-bold hover:underline flex items-center gap-2"
      >
        💬 Q/A Section ({questions.length}) {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div className="mt-4 space-y-6 bg-gray-900/50 p-4 rounded-lg">
          
          {/* প্রশ্ন করার ফর্ম */}
          {session ? (
            <form onSubmit={handlePostQuestion} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ask an anonymous question..."
                className="flex-1 bg-gray-800 border border-gray-600 rounded p-2 text-sm text-white"
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-indigo-600 px-3 py-2 rounded text-sm text-white hover:bg-indigo-500"
              >
                Ask
              </button>
            </form>
          ) : (
            <p className="text-gray-500 text-sm mb-4">Login to ask questions.</p>
          )}

          {/* প্রশ্নের তালিকা */}
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="flex justify-between items-start">
                  <p className="text-white font-medium text-sm">❓ {q.content}</p>
                  <Link href={`/student/${q.user.id}`} className="text-xs text-gray-400 hover:text-indigo-400">
                    @{q.user.nickname || "Anon"}
                  </Link>
                </div>

                {/* উত্তরসমূহ */}
                <div className="mt-2 ml-4 space-y-2 border-l-2 border-gray-600 pl-3">
                  {q.answers.map((ans) => (
                    <div key={ans.id} className="bg-gray-700/30 p-2 rounded text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-300">{ans.content}</span>
                        <Link href={`/student/${ans.user.id}`} className="text-gray-500 hover:text-indigo-300">
                          - @{ans.user.nickname || "Anon"}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* উত্তর দেওয়ার অপশন */}
                {session && (
                  <div className="mt-2">
                    {!replyOpen[q.id] ? (
                      <button 
                        onClick={() => setReplyOpen({ ...replyOpen, [q.id]: true })}
                        className="text-xs text-indigo-400 hover:underline ml-4"
                      >
                        Reply
                      </button>
                    ) : (
                      <div className="flex gap-2 mt-2 ml-4">
                        <input
                          type="text"
                          value={replyText[q.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [q.id]: e.target.value })}
                          placeholder="Write a reply..."
                          className="flex-1 bg-gray-700 border border-gray-600 rounded p-1 text-xs text-white"
                        />
                        <button 
                          onClick={() => handlePostAnswer(q.id)}
                          className="bg-green-600 px-2 py-1 rounded text-xs text-white"
                        >
                          Reply
                        </button>
                        <button 
                          onClick={() => setReplyOpen({ ...replyOpen, [q.id]: false })}
                          className="text-gray-400 text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}