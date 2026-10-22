"use client";

import React, { useState, useMemo } from "react";
import { Todo, Priority } from "@/lib/types";
import { TodoItem } from "./TodoItem";
import {
  Search,
  Trash,
  Inbox,
  ArrowUpDown,
  Loader2,
} from "lucide-react";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    data: { title: string; description?: string; priority: Priority; category: string }
  ) => Promise<void>;
  onClearCompleted: () => Promise<void>;
}

type TabFilter = "all" | "active" | "completed" | "high";
type SortOption = "newest" | "oldest" | "priority";

export const TodoList: React.FC<TodoListProps> = ({
  todos,
  isLoading,
  onToggle,
  onDelete,
  onUpdate,
  onClearCompleted,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("newest");

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    todos.forEach((t) => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set);
  }, [todos]);

  // Filtered & sorted todos
  const filteredTodos = useMemo(() => {
    let result = [...todos];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // Tab filter
    if (activeTab === "active") {
      result = result.filter((t) => !t.completed);
    } else if (activeTab === "completed") {
      result = result.filter((t) => t.completed);
    } else if (activeTab === "high") {
      result = result.filter((t) => t.priority === "high");
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "priority") {
        const pOrder: Record<Priority, number> = { high: 3, medium: 2, low: 1 };
        return pOrder[b.priority] - pOrder[a.priority];
      }
      return 0;
    });

    return result;
  }, [todos, searchQuery, activeTab, selectedCategory, sortBy]);

  const completedCount = todos.filter((t) => t.completed).length;

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหารายการ (ตามชื่อ, รายละเอียด หรือหมวดหมู่)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs shadow-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="newest">ล่าสุดมาก่อน</option>
              <option value="oldest">เก่าสุดมาก่อน</option>
              <option value="priority">ตามระดับความสำคัญ</option>
            </select>
          </div>

          {completedCount > 0 && (
            <button
              onClick={() => {
                if (window.confirm("ต้องการลบรายการที่ทำเสร็จแล้วทั้งหมดหรือไม่?")) {
                  onClearCompleted();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors shadow-sm shrink-0"
              title="Clear completed todos"
            >
              <Trash className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ล้างรายการเสร็จสิ้น</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs font-medium">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "all"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            ทั้งหมด ({todos.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "active"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            ยังไม่เสร็จ ({todos.length - completedCount})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "completed"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            เสร็จแล้ว ({completedCount})
          </button>
          <button
            onClick={() => setActiveTab("high")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === "high"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-sm font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            สำคัญสูง ({todos.filter((t) => t.priority === "high").length})
          </button>
        </div>

        {/* Categories Chips */}
        {categories.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-2.5 py-1 rounded-lg transition-all border ${
                selectedCategory === "all"
                  ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-bold"
                  : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              ทุกหมวดหมู่
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg transition-all border ${
                  selectedCategory === cat
                    ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 font-bold"
                    : "bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Todo Items List */}
      <div className="space-y-3 pt-2">
        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <Loader2 className="h-7 w-7 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">กำลังโหลดรายการ Todo จาก API...</p>
          </div>
        ) : filteredTodos.length > 0 ? (
          filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))
        ) : (
          /* Empty State */
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mx-auto">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {searchQuery ? "ไม่พบรายการที่ค้นหา" : "ยังไม่มีรายการสิ่งที่ต้องทำ"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {searchQuery
                  ? "ลองค้นหาด้วยคำอื่น หรือล้างคำค้นหาเพื่อดูรายการทั้งหมด"
                  : "เริ่มต้นจัดการงานของคุณด้วยการพิมพ์รายการที่กล่องด้านบนได้เลย"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
