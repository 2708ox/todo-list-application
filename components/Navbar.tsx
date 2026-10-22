"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <CheckCircle2 className="h-5 w-5 stroke-[2.2]" />
          </div>
          <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
            Todo List
          </span>
        </div>
      </div>
    </header>
  );
};
