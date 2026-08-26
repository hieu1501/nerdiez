"use client";

import { useCallback, useMemo, useRef, useState } from "react";

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

  const success = useCallback((message: string) => show("success", message), [show]);
  const error = useCallback((message: string) => show("error", message), [show]);
  const warning = useCallback((message: string) => show("warning", message), [show]);
  const info = useCallback((message: string) => show("info", message), [show]);

  return useMemo(
    () => ({ toasts, success, error, warning, info, remove }),
    [toasts, success, error, warning, info, remove],
  );
}
