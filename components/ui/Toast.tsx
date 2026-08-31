"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface ToastItem { id: number; message: string; tone: "good" | "bad" }
const ToastCtx = createContext<(message: string, tone?: "good" | "bad") => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((message: string, tone: "good" | "bad" = "good") => {
    const id = Date.now();
    setItems((s) => [...s, { id, message, tone }]);
    setTimeout(() => setItems((s) => s.filter((i) => i.id !== id)), 2600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-20 md:bottom-6 left-1/2 z-50 -translate-x-1/2 flex flex-col gap-2 items-center">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`animate-pop rounded-full px-4 py-2 text-sm font-semibold shadow-soft ${
              t.tone === "good" ? "bg-ink text-white" : "bg-bad text-white"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
