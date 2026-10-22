"use client";

import React, { useState } from "react";
import { Todo, Priority } from "@/lib/types";
import {
  Check,
  Trash2,
  Edit3,
  X,
  Save,
  Clock,
  Tag,
} from "lucide-react";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (
    id: string,
    data: { title: string; description?: string; priority: Priority; category: string }
  ) => Promise<void>;
}

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editDesc, setEditDesc] = useState(todo.description || "");
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority);
  const [editCategory, setEditCategory] = useState(todo.category);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim() || isSaving) return;
    setIsSaving(true);
    try {
      await onUpdate(todo.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        priority: editPriority,
        category: editCategory,
      });
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(todo.title);
    setEditDesc(todo.description || "");
    setEditPriority(todo.priority);
    setEditCategory(todo.category);
    setIsEditing(false);
  };

  const priorityStyles: Record<Priority, { label: string; badge: string; dot: string }> = {
    low: {
      label: "ต่ำ",
      badge:
        "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60",
      dot: "bg-emerald-500",
    },
    medium: {
      label: "ปานกลาง",
      badge:
        "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60",
      dot: "bg-amber-500",
    },
    high: {
      label: "สูง",
      badge:
        "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-800/60",
      dot: "bg-rose-500",
    },
  };

  const formattedDate = new Date(todo.created_at).toLocaleDateString("th-TH", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 overflow-hidden ${
        todo.completed
          ? "bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-80"
          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-300/60 dark:hover:border-indigo-700/60"
      }`}
    >
      <div className="p-4 sm:p-5 flex items-start gap-3 sm:gap-4">
        {/* Animated Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(todo.id, !todo.completed)}
          className={`mt-1 h-6 w-6 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0 border ${
            todo.completed
              ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20"
              : "border-slate-300 dark:border-slate-600 hover:border-indigo-500 hover:scale-105"
          }`}
          title={todo.completed ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จสิ้น"}
        >
          {todo.completed && <Check className="h-4 w-4 stroke-[3] animate-in zoom-in-50 duration-200" />}
        </button>

        {/* Content or Edit Mode */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            /* Edit Form */
            <div className="space-y-3">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-sm font-semibold text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="ชื่อรายการ"
                autoFocus
              />
              <textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
                className="w-full bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                placeholder="รายละเอียด..."
              />
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <select
                    value={editPriority}
                    onChange={(e) => setEditPriority(e.target.value as Priority)}
                    className="bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="low">ระดับ: ต่ำ</option>
                    <option value="medium">ระดับ: ปานกลาง</option>
                    <option value="high">ระดับ: สูง</option>
                  </select>
                  <input
                    type="text"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    placeholder="หมวดหมู่"
                    className="w-24 bg-slate-50 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 rounded-lg px-2 py-1 border border-slate-300 dark:border-slate-700"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving || !editTitle.trim()}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-40"
                  >
                    <Save className="h-3.5 w-3.5" />
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Normal View */
            <div>
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={`text-base font-semibold leading-snug transition-all ${
                    todo.completed
                      ? "line-through text-slate-400 dark:text-slate-500"
                      : "text-slate-800 dark:text-slate-100"
                  }`}
                >
                  {todo.title}
                </h3>
              </div>

              {todo.description && (
                <p
                  className={`mt-1 text-xs leading-relaxed ${
                    todo.completed
                      ? "text-slate-400 dark:text-slate-600 line-through"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {todo.description}
                </p>
              )}

              {/* Badges & Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {/* Priority */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                    priorityStyles[todo.priority].badge
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      priorityStyles[todo.priority].dot
                    }`}
                  />
                  {priorityStyles[todo.priority].label}
                </span>

                {/* Category */}
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Tag className="h-3 w-3 text-slate-400" />
                  {todo.category}
                </span>

                {/* Timestamp */}
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 ml-auto">
                  <Clock className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Actions (Edit / Delete) */}
        {!isEditing && (
          <div className="flex items-center gap-1 shrink-0 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
              title="แก้ไขรายการ"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`ต้องการลบรายการ "${todo.title}" หรือไม่?`)) {
                  onDelete(todo.id);
                }
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
              title="ลบรายการ"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
