"use client";

// src/components/AdminDisplayOrderControl.tsx

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

type CriterionKey =
  | "reviews_desc" | "reviews_asc"
  | "zero_review_last" | "zero_review_first"
  | "rating_desc" | "rating_asc"
  | "alpha_asc" | "alpha_desc"
  | "newest" | "oldest" | "recently_reviewed"
  | "random" | "dept_priority";

type CriterionDef = {
  value: CriterionKey;
  label: string;
  desc: string;
  group: string;
};

const ALL_CRITERIA: CriterionDef[] = [
  { value: "reviews_desc",      label: "সবচেয়ে বেশি review আগে",        desc: "Review count বেশি — আগে",                   group: "📊 Review" },
  { value: "reviews_asc",       label: "সবচেয়ে কম review আগে",         desc: "Review count কম — আগে",                    group: "📊 Review" },
  { value: "zero_review_last",  label: "Zero review — শেষে",            desc: "Review নেই এমন faculty সবার পরে",           group: "📊 Review" },
  { value: "zero_review_first", label: "Zero review — আগে",             desc: "Review নেই এমন faculty সবার আগে",           group: "📊 Review" },
  { value: "rating_desc",       label: "সর্বোচ্চ rating আগে",           desc: "Average rating বেশি — আগে",                group: "⭐ Rating" },
  { value: "rating_asc",        label: "সর্বনিম্ন rating আগে",          desc: "Average rating কম — আগে",                  group: "⭐ Rating" },
  { value: "alpha_asc",         label: "নাম A → Z",                     desc: "Alphabetical ascending",                    group: "🔤 নাম"   },
  { value: "alpha_desc",        label: "নাম Z → A",                     desc: "Alphabetical descending",                   group: "🔤 নাম"   },
  { value: "newest",            label: "নতুন যোগ করা আগে",              desc: "Database এ সবচেয়ে সম্প্রতি add হয়েছে",    group: "📅 সময়"  },
  { value: "oldest",            label: "পুরনো faculty আগে",             desc: "Database এ সবচেয়ে আগে add হয়েছে",         group: "📅 সময়"  },
  { value: "recently_reviewed", label: "সম্প্রতি review পেয়েছে আগে",  desc: "Latest review date অনুযায়ী",               group: "📅 সময়"  },
  { value: "random",            label: "Random (প্রতিদিন বদলায়)",       desc: "Daily seed দিয়ে consistent shuffle",        group: "🔀 বিশেষ" },
  { value: "dept_priority",     label: "Department priority অনুযায়ী",  desc: "নিচে department order নির্ধারণ করুন",      group: "🔀 বিশেষ" },
];

const GROUPS = ["📊 Review", "⭐ Rating", "🔤 নাম", "📅 সময়", "🔀 বিশেষ"];

const VALID_KEYS = new Set<string>(ALL_CRITERIA.map((c) => c.value));

type Props = {
  currentCriteria: string[];
  currentDeptOrder: string[];
  allDepartments: string[];
};

const smallBtn =
  "w-9 h-9 md:w-7 md:h-7 rounded flex items-center justify-center text-xs transition disabled:opacity-30";

export default function AdminDisplayOrderControl({
  currentCriteria,
  currentDeptOrder,
  allDepartments,
}: Props) {
  // অচেনা/পুরোনো key থাকলে বাদ দেওয়া হয়, যাতে ফাঁকা সারি না দেখায়
  const initCriteria = (): CriterionKey[] => {
    const valid = currentCriteria.filter((c) => VALID_KEYS.has(c)) as CriterionKey[];
    return valid.length > 0 ? valid : ["reviews_desc"];
  };

  const initDeptOrder = (): string[] => {
    const saved = currentDeptOrder.filter((d) => allDepartments.includes(d));
    const missing = allDepartments.filter((d) => !saved.includes(d));
    return [...saved, ...missing];
  };

  const [criteria, setCriteria] = useState<CriterionKey[]>(initCriteria);
  const [deptOrder, setDeptOrder] = useState<string[]>(initDeptOrder);
  const [saved, setSaved] = useState(() => ({
    criteria: initCriteria(),
    deptOrder: initDeptOrder(),
  }));

  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(GROUPS[0]);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // মেনুর বাইরে ক্লিক করলে বন্ধ হবে
  useEffect(() => {
    if (!showAddMenu) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowAddMenu(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [showAddMenu]);

  const addCriterion = (key: CriterionKey) => {
    if (!criteria.includes(key)) {
      setCriteria((p) => [...p, key]);
    }
    setShowAddMenu(false);
  };

  const removeCriterion = (index: number) => {
    setCriteria((p) => p.filter((_, i) => i !== index));
  };

  const moveCriterion = (index: number, dir: "up" | "down") => {
    const arr = [...criteria];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    setCriteria(arr);
  };

  const moveDept = (index: number, dir: "up" | "down") => {
    const arr = [...deptOrder];
    const swap = dir === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= arr.length) return;
    [arr[index], arr[swap]] = [arr[swap], arr[index]];
    setDeptOrder(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const [r1, r2] = await Promise.all([
        fetch("/api/admin/display-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "faculty_sort_criteria", value: JSON.stringify(criteria) }),
        }),
        fetch("/api/admin/display-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "dept_priority_order", value: JSON.stringify(deptOrder) }),
        }),
      ]);
      if (r1.ok && r2.ok) {
        toast.success("Display order saved!");
        setSaved({ criteria: [...criteria], deptOrder: [...deptOrder] });
      } else {
        toast.error("Save failed.");
      }
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  };

  const alreadyAdded = new Set(criteria);
  const availableToAdd = ALL_CRITERIA.filter((c) => !alreadyAdded.has(c.value));
  const showDeptOrder = criteria.includes("dept_priority");

  // যে group-এ আর যোগ করার কিছু নেই সেটা লুকানো থাকবে, আর selected group সবসময় দৃশ্যমান থাকবে
  const visibleGroups = GROUPS.filter((g) => availableToAdd.some((c) => c.group === g));
  const activeGroup = visibleGroups.includes(selectedGroup) ? selectedGroup : visibleGroups[0];

  // অসংরক্ষিত বদল আছে কিনা
  const criteriaChanged = JSON.stringify(criteria) !== JSON.stringify(saved.criteria);
  const deptChanged =
    showDeptOrder && JSON.stringify(deptOrder) !== JSON.stringify(saved.deptOrder);
  const isDirty = criteriaChanged || deptChanged;

  return (
    <div className="glass-card rounded-2xl">
      {/* Header */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 p-4 md:p-6 text-left rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">🎛️</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Faculty Display Order
              </span>
              {isDirty && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                  অসংরক্ষিত বদল
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2 break-words">
              {criteria.length === 0
                ? "কোনো criteria নেই"
                : criteria
                    .map((c) => ALL_CRITERIA.find((x) => x.value === c)?.label)
                    .join(" → ")}
            </p>
          </div>
        </div>
        <span
          className="text-gray-400 text-xl transition-transform duration-200 shrink-0"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0)" }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {isOpen && (
        <div className="px-4 md:px-6 pb-6 border-t border-gray-200 dark:border-gray-700 space-y-6">
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            নিচের criteria গুলো <span className="font-semibold">উপর থেকে নিচে</span> priority অনুযায়ী apply হবে।
            প্রথম criteria তে tie হলে দ্বিতীয়টা, তারপর তৃতীয়টা — এভাবে।
          </p>

          {/* Current criteria list */}
          <div className="space-y-2">
            {criteria.length === 0 && (
              <p className="text-sm text-gray-400 italic text-center py-4">
                কোনো criteria যোগ করা হয়নি
              </p>
            )}
            {criteria.map((key, idx) => {
              const def = ALL_CRITERIA.find((c) => c.value === key);
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl px-3 md:px-4 py-3"
                >
                  {/* Priority badge */}
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 break-words">
                      {def?.label}
                    </p>
                    <p className="text-xs text-indigo-700 dark:text-indigo-300 break-words">
                      {def?.desc}
                    </p>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                    <button
                      onClick={() => moveCriterion(idx, "up")}
                      disabled={idx === 0}
                      aria-label="উপরে নিন"
                      title="উপরে নিন"
                      className={`${smallBtn} text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800`}
                    >▲</button>
                    <button
                      onClick={() => moveCriterion(idx, "down")}
                      disabled={idx === criteria.length - 1}
                      aria-label="নিচে নিন"
                      title="নিচে নিন"
                      className={`${smallBtn} text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-800`}
                    >▼</button>
                    <button
                      onClick={() => removeCriterion(idx)}
                      aria-label="সরিয়ে দিন"
                      title="সরিয়ে দিন"
                      className={`${smallBtn} text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30`}
                    >✕</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add criteria button */}
          {availableToAdd.length > 0 && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowAddMenu((p) => !p)}
                aria-expanded={showAddMenu}
                className="w-full py-3 md:py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
              >
                + আরো criteria যোগ করুন
              </button>

              {showAddMenu && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-20">
                  {/* Group tabs */}
                  <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-700 px-2 pt-2 gap-1">
                    {visibleGroups.map((g) => (
                      <button
                        key={g}
                        onClick={() => setSelectedGroup(g)}
                        className={`px-3 py-2 md:py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition ${
                          activeGroup === g
                            ? "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-b-2 border-indigo-500"
                            : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  {/* Options in selected group */}
                  <div className="p-2 space-y-1 max-h-72 overflow-y-auto">
                    {availableToAdd
                      .filter((c) => c.group === activeGroup)
                      .map((c) => (
                        <button
                          key={c.value}
                          onClick={() => addCriterion(c.value)}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition"
                        >
                          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                            {c.label}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {c.desc}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Department priority order — shown only when dept_priority is in criteria */}
          {showDeptOrder && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1">
                🏢 Department Priority Order
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-400 mb-3">
                উপরে থাকা department এর faculty আগে দেখাবে। ▲ ▼ দিয়ে সাজান।
              </p>
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {deptOrder.map((dept, idx) => (
                  <div
                    key={dept}
                    className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-3 py-2 border border-gray-200 dark:border-gray-700"
                  >
                    <span className="text-xs font-bold text-gray-400 w-5 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span className="flex-1 min-w-0 text-sm font-medium text-gray-800 dark:text-gray-200 break-words">
                      {dept}
                    </span>
                    <div className="flex gap-0.5 md:gap-1 shrink-0">
                      <button
                        onClick={() => moveDept(idx, "up")}
                        disabled={idx === 0}
                        aria-label="উপরে নিন"
                        title="উপরে নিন"
                        className={`${smallBtn} text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >▲</button>
                      <button
                        onClick={() => moveDept(idx, "down")}
                        disabled={idx === deptOrder.length - 1}
                        aria-label="নিচে নিন"
                        title="নিচে নিন"
                        className={`${smallBtn} text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700`}
                      >▼</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          <div className="space-y-2">
            <p
              className={`text-xs text-center ${
                criteria.length === 0
                  ? "text-red-500"
                  : isDirty
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {criteria.length === 0
                ? "অন্তত একটি criteria যোগ করুন"
                : isDirty
                ? "আপনার বদল এখনো সংরক্ষণ হয়নি"
                : "সব বদল সংরক্ষিত আছে"}
            </p>
            <button
              onClick={handleSave}
              disabled={saving || criteria.length === 0}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-sm transition shadow-lg shadow-indigo-500/20"
            >
              {saving ? "সেভ হচ্ছে..." : "✓ Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}