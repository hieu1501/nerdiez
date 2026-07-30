"use client";

import { useCallback, useRef, useState } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let nextId = 0;

export function useToast(duration = 4000) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: number) => {
    timers.current.delete(id);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId++;
      setToasts((prev) => [...prev, { id, type, message }]);
      const timer = setTimeout(() => remove(id), duration);
      timers.current.set(id, timer);
    },
    [duration, remove],
  );

  return {
    toasts,
    success: (msg: string) => show("success", msg),
    error: (msg: string) => show("error", msg),
    warning: (msg: string) => show("warning", msg),
    info: (msg: string) => show("info", msg),
    remove,
  };
}
