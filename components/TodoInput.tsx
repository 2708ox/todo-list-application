"use client";

import React, { useState } from "react";
import { Plus, Tag, Flag, AlignLeft, Sparkles } from "lucide-react";
import { Priority } from "@/lib/types";

interface TodoInputProps {
  onAdd: (data: {
    title: string;
    description?: string;
    priority: Priority;
    category: string;
  }) => Promise<void>;
  isLoading: boolean;
}

const CATEGORIES = ["General", "Work", "Personal", "Study", "Project", "Bug"];

export const TodoInput: React.FC<TodoInputProps> = ({ onAdd, isLoading }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("General");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isLoading) return;

    await onAdd({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
    });

    setTitle("");
    setDescription("");
    setIsExpanded(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900/90 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/80 dark:border-slate-800 transition-all overflow-hidden p-4 sm:p-5">
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main Input Row */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="เพิ่มรายการสิ่งที่ต้องทำ... (พิมพ์ชื่อแล้วกด Enter)"
            className="flex-1 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-medium text-base focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!title.trim() || isLoading}
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 active:scale-[0.98] transition-all shadow-md shadow-indigo-500/25 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>

        {/* Expanded Options */}
        {isExpanded && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Description */}
            <div className="flex items-start gap-2">
              <AlignLeft className="h-4 w-4 text-slate-400 mt-2 shrink-0" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="รายละเอียดเพิ่มเติม (ระบุหรือไม่ก็ได้)..."
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-200/60 dark:border-slate-700/60 resize-none"
              />
            </div>

            {/* Attributes Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex flex-wrap items-center gap-4">
                {/* Priority Selector */}
                <div className="flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">ระดับความสำคัญ:</span>
                  <div className="flex gap-1">
                    {(["low", "medium", "high"] as Priority[]).map((p) => {
                      const active = priority === p;
                      const colors = {
                        low: active
                          ? "bg-emerald-500 text-white"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100",
                        medium: active
                          ? "bg-amber-500 text-white"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 hover:bg-amber-100",
                        high: active
                          ? "bg-rose-500 text-white"
                          : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100",
                      };
                      return (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPriority(p)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold capitalize transition-colors ${colors[p]}`}
                        >
                          {p === "low" ? "ต่ำ" : p === "medium" ? "ปานกลาง" : "สูง"}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Category Selector */}
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs text-slate-500 font-medium">หมวดหมู่:</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mobile Submit Button */}
              <div className="w-full sm:hidden flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsExpanded(false)}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || isLoading}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                  เพิ่มรายการ
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
