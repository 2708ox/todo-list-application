"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Todo, Priority } from "@/lib/types";
import { Navbar } from "@/components/Navbar";
import { TodoInput } from "@/components/TodoInput";
import { TodoList } from "@/components/TodoList";
import { CheckCircle, Calendar } from "lucide-react";

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  // Fetch all todos from RESTful API (Requirement 8)
  const fetchTodos = useCallback(async () => {
    try {
      const res = await fetch("/api/todos");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setTodos(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      showToast("ไม่สามารถดึงข้อมูลรายการได้");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    const initialLoad = async () => {
      try {
        const res = await fetch("/api/todos");
        const json = await res.json();
        if (!ignore && json.success && Array.isArray(json.data)) {
          setTodos(json.data);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Initial load failed:", err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    };
    initialLoad();

    return () => {
      ignore = true;
    };
  }, []);

  // Create Todo (Requirement 1, 6, 7)
  const handleAddTodo = async (data: {
    title: string;
    description?: string;
    priority: Priority;
    category: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/todos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTodos((prev) => [json.data, ...prev]);
        showToast("เพิ่มรายการใหม่เรียบร้อยแล้ว");
      } else {
        showToast(json.error || "ไม่สามารถเพิ่มรายการได้");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Todo Status (Requirement 3, 6, 7)
  const handleToggle = async (id: string, completed: boolean) => {
    // Optimistic UI update
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed } : t))
    );

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      });
      const json = await res.json();
      if (!json.success) {
        // Rollback
        await fetchTodos();
        showToast("ปรับปรุงสถานะไม่สำเร็จ");
      }
    } catch {
      await fetchTodos();
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Update Todo Details (Requirement 6, 7)
  const handleUpdate = async (
    id: string,
    data: {
      title: string;
      description?: string;
      priority: Priority;
      category: string;
    }
  ) => {
    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setTodos((prev) =>
          prev.map((t) => (t.id === id ? json.data : t))
        );
        showToast("บันทึกการแก้ไขเรียบร้อยแล้ว");
      } else {
        showToast(json.error || "แก้ไขข้อมูลไม่สำเร็จ");
      }
    } catch {
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Delete Todo (Requirement 2, 6, 7)
  const handleDelete = async (id: string) => {
    // Optimistic UI update
    const prevList = [...todos];
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      const res = await fetch(`/api/todos/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("ลบรายการเรียบร้อยแล้ว");
      } else {
        setTodos(prevList);
        showToast(json.error || "ลบรายการไม่สำเร็จ");
      }
    } catch {
      setTodos(prevList);
      showToast("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  // Clear Completed Todos
  const handleClearCompleted = async () => {
    const completed = todos.filter((t) => t.completed);
    for (const item of completed) {
      await fetch(`/api/todos/${item.id}`, { method: "DELETE" });
    }
    setTodos((prev) => prev.filter((t) => !t.completed));
    showToast(`ล้างรายการที่เสร็จสิ้น ${completed.length} รายการแล้ว`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              รายการสิ่งที่ต้องทำ
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              จัดระเบียบงาน ติดตามความคืบหน้า และทำงานให้สำเร็จตามเป้าหมายของคุณ
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 shadow-sm font-medium">
              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
              <span>จัดการงานประจำวัน</span>
            </span>
          </div>
        </div>

        {/* Input Form */}
        <TodoInput onAdd={handleAddTodo} isLoading={isLoading} />

        {/* Todo List Component */}
        <TodoList
          todos={todos}
          isLoading={isLoading}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onUpdate={handleUpdate}
          onClearCompleted={handleClearCompleted}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/80 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Todo List. เพิ่มประสิทธิภาพการทำงานของคุณในทุกวัน</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>ความเป็นส่วนตัว</span>
            <span>•</span>
            <span>ข้อกำหนดการใช้งาน</span>
            <span>•</span>
            <span>ความช่วยเหลือ</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}
